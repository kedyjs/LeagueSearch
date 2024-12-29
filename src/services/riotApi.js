const axios = require('axios');

class RiotAPI {
    constructor() {
        if (!process.env.RIOT_API_KEY) {
            throw new Error('RIOT_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.');
        }
        this.apiKey = process.env.RIOT_API_KEY;
        // API endpoint'leri
        this.accountUrl = 'https://europe.api.riotgames.com';
        this.baseUrl = 'https://tr1.api.riotgames.com';
        this.region = 'tr1';
        this.version = '14.1.1'; // DataDragon versiyonu
    }

    handleApiError(error, method) {
        console.error(`=== RIOT API HATA DETAYI ===`);
        console.error(`Metod: ${method}`);
        console.error(`Zaman: ${new Date().toISOString()}`);
        
        if (error.response) {
            const { status, headers, data } = error.response;
            console.error(`Status: ${status}`);
            console.error(`Headers:`, JSON.stringify(headers, null, 2));
            console.error(`Data:`, JSON.stringify(data, null, 2));

            // API anahtarı ve yetki hataları için özel mesajlar
            if (status === 403) {
                if (method === 'getLiveGame') {
                    throw new Error('Canlı maç verilerine erişim izniniz yok. Lütfen PERSONAL API KEY başvurusu yapın.');
                } else if (method === 'getRankedInfo') {
                    throw new Error('Sıralama verilerine erişim izniniz yok. Lütfen PERSONAL API KEY başvurusu yapın.');
                } else {
                    throw new Error('Bu API endpoint\'ine erişim izniniz yok. Lütfen PERSONAL API KEY başvurusu yapın.');
                }
            }
            if (status === 429) {
                throw new Error('API istek limiti aşıldı. Lütfen biraz bekleyin.');
            }
            if (status === 404) {
                if (method === 'getLiveGame') {
                    throw new Error('Oyuncu şu anda aktif bir oyunda değil.');
                } else if (method === 'getSummonerByName') {
                    throw new Error('Sihirdar bulunamadı. Lütfen kullanıcı adını kontrol edin.');
                }
            }
        }

        console.error(`İstek URL: ${error.config?.url}`);
        console.error(`İstek Metodu: ${error.config?.method}`);
        console.error(`İstek Headers:`, JSON.stringify(error.config?.headers, null, 2));
        console.error(`Stack:`, error.stack);
        console.error(`========================`);

        throw new Error(`${method} işlemi sırasında bir hata oluştu. Detaylar için konsolu kontrol edin.`);
    }

    formatRiotId(summonerName) {
        // Riot ID formatını kontrol et (gameName#tagLine)
        const [gameName, tagLine] = summonerName.split('#');
        if (!gameName || !tagLine) {
            throw new Error('Lütfen Riot ID\'nizi "kullanıcıAdı#tag" formatında girin. Örnek: OYUNCU#TR1');
        }
        return { gameName, tagLine };
    }

    async getSummonerByName(summonerName) {
        try {
            console.log(`[Riot API] Sihirdar aranıyor: ${summonerName}`);
            const { gameName, tagLine } = this.formatRiotId(summonerName);
            
            // 1. Riot ID'den PUUID al (Account-V1 API)
            const accountResponse = await axios.get(
                `${this.accountUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
                { 
                    headers: { 
                        'X-Riot-Token': this.apiKey,
                        'Accept-Language': 'tr_TR,tr;q=0.9'
                    }
                }
            );
            
            if (!accountResponse.data || !accountResponse.data.puuid) {
                console.error('Account Response:', JSON.stringify(accountResponse.data, null, 2));
                throw new Error('PUUID alınamadı');
            }

            console.log(`[Riot API] PUUID bulundu: ${accountResponse.data.puuid}`);
            
            // 2. PUUID ile hesap detaylarını al (Summoner-V4 API)
            const summonerResponse = await axios.get(
                `${this.baseUrl}/lol/summoner/v4/summoners/by-puuid/${accountResponse.data.puuid}`,
                { 
                    headers: { 
                        'X-Riot-Token': this.apiKey,
                        'Accept-Language': 'tr_TR,tr;q=0.9'
                    }
                }
            );

            if (!summonerResponse.data) {
                console.error('Summoner Response:', JSON.stringify(summonerResponse.data, null, 2));
                throw new Error('Sihirdar bilgileri alınamadı');
            }

            // Debug log
            console.log('Summoner Response Data:', JSON.stringify(summonerResponse.data, null, 2));
            
            // Riot ID ve hesap bilgilerini birleştir
            const summonerData = {
                ...summonerResponse.data,
                riotId: `${gameName}#${tagLine}`,
                gameName: gameName,
                tagLine: tagLine,
                puuid: accountResponse.data.puuid
            };
            
            console.log(`[Riot API] Sihirdar bulundu: ${summonerData.name || gameName}`);
            return summonerData;
        } catch (error) {
            this.handleApiError(error, 'getSummonerByName');
        }
    }

    async getLiveGame(summonerId) {
        try {
            console.log(`[Riot API] Canlı oyun aranıyor: ${summonerId}`);
            const response = await axios.get(
                `${this.baseUrl}/lol/spectator/v5/active-games/by-summoner/${summonerId}`,
                { 
                    headers: { 
                        'X-Riot-Token': this.apiKey,
                        'Accept-Language': 'tr_TR,tr;q=0.9'
                    }
                }
            );

            if (!response.data) {
                throw new Error('Canlı oyun verisi alınamadı');
            }

            // Debug log ekle
            console.log('Live Game Response:', JSON.stringify(response.data, null, 2));

            // Oyuncuların detaylı bilgilerini al
            const participants = response.data.participants;
            const detailedParticipants = await Promise.all(
                participants.map(async (participant) => {
                    try {
                        const rankData = await this.getRankedInfo(participant.summonerId);
                        return {
                            ...participant,
                            riotIdGameName: participant.riotId || `${participant.riotIdGameName || participant.summonerName}#${participant.riotIdTagline || 'TR1'}`,
                            rankInfo: rankData
                        };
                    } catch (error) {
                        console.error(`Rank bilgisi alınamadı: ${participant.summonerName}`, error);
                        return {
                            ...participant,
                            riotIdGameName: participant.riotId || `${participant.riotIdGameName || participant.summonerName}#${participant.riotIdTagline || 'TR1'}`,
                            rankInfo: []
                        };
                    }
                })
            );

            // Takımları ayır
            const blueTeam = detailedParticipants.filter(p => p.teamId === 100);
            const redTeam = detailedParticipants.filter(p => p.teamId === 200);

            // Ban bilgilerini düzenle
            const bans = {
                blue: response.data.bannedChampions.filter(ban => ban.teamId === 100),
                red: response.data.bannedChampions.filter(ban => ban.teamId === 200)
            };

            return {
                gameId: response.data.gameId,
                gameType: response.data.gameType,
                gameStartTime: response.data.gameStartTime,
                mapId: response.data.mapId,
                gameLength: response.data.gameLength,
                platformId: response.data.platformId,
                gameMode: response.data.gameType === 'MATCHED_GAME' ? 'RANKED_SOLO_5x5' : response.data.gameMode,
                bannedChampions: bans,
                blueTeam,
                redTeam
            };
        } catch (error) {
            this.handleApiError(error, 'getLiveGame');
        }
    }

    async getRankedInfo(summonerId) {
        try {
            console.log(`[Riot API] Sıralama bilgisi alınıyor: ${summonerId}`);
            const response = await axios.get(
                `${this.baseUrl}/lol/league/v4/entries/by-summoner/${summonerId}`,
                { 
                    headers: { 
                        'X-Riot-Token': this.apiKey,
                        'Accept-Language': 'tr_TR,tr;q=0.9'
                    }
                }
            );

            if (!response.data) {
                throw new Error('Sıralama bilgileri alınamadı');
            }

            console.log(`[Riot API] Sıralama bilgisi alındı: ${response.data.length} kayıt`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'getRankedInfo');
        }
    }

    // Şampiyon bilgilerini al
    async getChampionInfo(championId) {
        try {
            const response = await axios.get(
                `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/tr_tr/v1/champions/${championId}.json`
            );
            return response.data;
        } catch (error) {
            console.error(`Şampiyon bilgisi alınamadı: ${championId}`, error);
            return null;
        }
    }

    // Büyü bilgilerini al
    async getSummonerSpellInfo(spellId) {
        try {
            const response = await axios.get(
                `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/tr_tr/v1/summoner-spells/${spellId}.json`
            );
            return response.data;
        } catch (error) {
            console.error(`Büyü bilgisi alınamadı: ${spellId}`, error);
            return null;
        }
    }
}

module.exports = new RiotAPI(); 