const { 
    Events, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const MainMenu = require('../interfaces/mainMenu');
const riotApi = require('../services/riotApi');
const searchHistory = require('../services/searchHistory');

// Rank emojileri ve renkleri
const RANK_COLORS = {
    IRON: '#452700',
    BRONZE: '#7A5312',
    SILVER: '#7B7B7B', 
    GOLD: '#EFB14C',
    PLATINUM: '#4DC1C2',
    DIAMOND: '#576BCE',
    MASTER: '#9D3FAE',
    GRANDMASTER: '#CD4545',
    CHALLENGER: '#F4C874'
};

// Rank ikonları için URL'ler
const RANK_ICONS = {
    IRON: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/iron.png',
    BRONZE: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/bronze.png',
    SILVER: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/silver.png',
    GOLD: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/gold.png',
    PLATINUM: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/platinum.png',
    DIAMOND: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/diamond.png',
    MASTER: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/master.png',
    GRANDMASTER: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/grandmaster.png',
    CHALLENGER: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/challenger.png',
    UNRANKED: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked/badges/unranked.png'
};

// Queue tipi emojileri
const QUEUE_EMOJIS = {
    RANKED_SOLO_5x5: '👤',  // Solo/Duo
    RANKED_FLEX_SR: '👥',   // Flex
};

// Oyun modu emojileri ve isimleri
const GAME_MODES = {
    CLASSIC: { emoji: '🏰', name: 'Klasik' },
    ARAM: { emoji: '🌉', name: 'ARAM' },
    URF: { emoji: '⚡', name: 'URF' },
    TFT: { emoji: '🎲', name: 'TFT' },
    PRACTICETOOL: { emoji: '🛠️', name: 'Antrenman' },
    RANKED_SOLO_5x5: { emoji: '👤', name: 'Dereceli Solo/Duo' },
    RANKED_FLEX_SR: { emoji: '👥', name: 'Dereceli Flex' },
    CUSTOM: { emoji: '🎮', name: 'Özel Oyun' }
};

// Şampiyon ID'leri ve isimleri
const CHAMPION_NAMES = {
    1: 'Annie', 2: 'Olaf', 3: 'Galio', 4: 'Twisted Fate', 5: 'Xin Zhao',
    6: 'Urgot', 7: 'LeBlanc', 8: 'Vladimir', 9: 'Fiddlesticks', 10: 'Kayle',
    11: 'Master Yi', 12: 'Alistar', 13: 'Ryze', 14: 'Sion', 15: 'Sivir',
    16: 'Soraka', 17: 'Teemo', 18: 'Tristana', 19: 'Warwick', 20: 'Nunu',
    21: 'Miss Fortune', 22: 'Ashe', 23: 'Tryndamere', 24: 'Jax', 25: 'Morgana',
    26: 'Zilean', 27: 'Singed', 28: 'Evelynn', 29: 'Twitch', 30: 'Karthus',
    31: "Cho'Gath", 32: 'Amumu', 33: 'Rammus', 34: 'Anivia', 35: 'Shaco',
    36: 'Dr. Mundo', 37: 'Sona', 38: 'Kassadin', 39: 'Irelia', 40: 'Janna',
    41: 'Gangplank', 42: 'Corki', 43: 'Karma', 44: 'Taric', 45: 'Veigar',
    48: 'Trundle', 50: 'Swain', 51: 'Caitlyn', 53: 'Blitzcrank', 54: 'Malphite',
    55: 'Katarina', 56: 'Nocturne', 57: 'Maokai', 58: 'Renekton', 59: 'JarvanIV',
    60: 'Elise', 61: 'Orianna', 62: 'Wukong', 63: 'Brand', 64: 'LeeSin',
    67: 'Vayne', 68: 'Rumble', 69: 'Cassiopeia', 72: 'Skarner', 74: 'Heimerdinger',
    75: 'Nasus', 76: 'Nidalee', 77: 'Udyr', 78: 'Poppy', 79: 'Gragas',
    80: 'Pantheon', 81: 'Ezreal', 82: 'Mordekaiser', 83: 'Yorick', 84: 'Akali',
    85: 'Kennen', 86: 'Garen', 89: 'Leona', 90: 'Malzahar', 91: 'Talon',
    92: 'Riven', 96: "Kog'Maw", 98: 'Shen', 99: 'Lux', 101: 'Xerath',
    102: 'Shyvana', 103: 'Ahri', 104: 'Graves', 105: 'Fizz', 106: 'Volibear',
    107: 'Rengar', 110: 'Varus', 111: 'Nautilus', 112: 'Viktor', 113: 'Sejuani',
    114: 'Fiora', 115: 'Ziggs', 117: 'Lulu', 119: 'Draven', 120: 'Hecarim',
    121: "Kha'Zix", 122: 'Darius', 126: 'Jayce', 127: 'Lissandra', 131: 'Diana',
    133: 'Quinn', 134: 'Syndra', 136: 'AurelionSol', 141: 'Kayn', 142: 'Zoe',
    143: 'Zyra', 145: "Kai'sa", 147: "Seraphine", 150: 'Gnar', 154: 'Zac',
    157: 'Yasuo', 161: "Vel'Koz", 163: 'Taliyah', 164: 'Camille', 201: 'Braum',
    202: 'Jhin', 203: 'Kindred', 222: 'Jinx', 223: 'TahmKench', 234: 'Viego',
    235: 'Senna', 236: 'Lucian', 238: 'Zed', 240: 'Kled', 245: 'Ekko',
    246: 'Qiyana', 254: 'Vi', 266: 'Aatrox', 267: 'Nami', 268: 'Azir',
    350: 'Yuumi', 360: 'Samira', 412: 'Thresh', 420: 'Illaoi', 421: "Rek'Sai",
    427: 'Ivern', 429: 'Kalista', 432: 'Bard', 497: 'Rakan', 498: 'Xayah',
    516: 'Ornn', 517: 'Sylas', 526: 'Rell', 555: 'Pyke', 711: "K'Sante",
    777: "Yone", 875: "Sett", 876: "Lillia", 887: "Gwen", 888: "Renata Glasc",
    895: "Nilah", 897: "K'Sante", 902: "Milio", 950: "Naafiri"
};

// Takım renkleri
const TEAM_COLORS = {
    BLUE: '#1E88E5',
    RED: '#E53935'
};

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (interaction.isButton()) {
                let recentSearches;
                
                switch (interaction.customId) {
                    case 'search_summoner':
                        // Son aramaları al
                        recentSearches = searchHistory.getSearches(interaction.user.id);
                        
                        if (recentSearches.length > 0) {
                            // Eğer geçmiş aramalar varsa, önce onları göster
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('recent_searches')
                                        .setPlaceholder('Son Aramalarınız')
                                        .addOptions(
                                            recentSearches.map(search => ({
                                                label: search.riotId,
                                                value: search.riotId,
                                                description: `${Math.floor((Date.now() - search.timestamp) / 60000)} dakika önce`,
                                            }))
                                        )
                                );

                            const newSearchButton = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('new_search')
                                        .setLabel('Yeni Sihirdar Ara')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('🔍')
                                );

                            await interaction.reply({
                                content: 'Son aramalarınızdan seçim yapın veya yeni arama yapın:',
                                components: [row, newSearchButton],
                                ephemeral: true
                            });
                        } else {
                            // Geçmiş arama yoksa direkt modal göster
                            await showSearchModal(interaction);
                        }
                        break;

                    case 'new_search':
                        await showSearchModal(interaction);
                        break;

                    case 'live_game':
                        // Son aramaları al
                        recentSearches = searchHistory.getSearches(interaction.user.id);
                        
                        if (recentSearches.length > 0) {
                            // Eğer geçmiş aramalar varsa, önce onları göster
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('recent_live_game_searches')
                                        .setPlaceholder('Son Aramalarınız')
                                        .addOptions(
                                            recentSearches.map(search => ({
                                                label: search.riotId,
                                                value: search.riotId,
                                                description: `${Math.floor((Date.now() - search.timestamp) / 60000)} dakika önce`,
                                            }))
                                        )
                                );

                            const newSearchButton = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('new_live_game_search')
                                        .setLabel('Yeni Sihirdar Ara')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('🔍')
                                );

                            await interaction.reply({
                                content: 'Son aramalarınızdan seçim yapın veya yeni arama yapın:',
                                components: [row, newSearchButton],
                                ephemeral: true
                            });
                        } else {
                            // Geçmiş arama yoksa direkt modal göster
                            await showLiveGameModal(interaction);
                        }
                        break;

                    case 'new_live_game_search':
                        await showLiveGameModal(interaction);
                        break;

                    case 'rankings':
                        await interaction.deferReply({ ephemeral: true });
                        await interaction.editReply({
                            content: "Bu özellik yakında eklenecek!",
                            ephemeral: true
                        });
                        break;

                    case 'builds':
                        await interaction.deferReply({ ephemeral: true });
                        await interaction.editReply({
                            content: "Bu özellik yakında eklenecek!",
                            ephemeral: true
                        });
                        break;

                    default:
                        await interaction.reply({
                            content: 'Bilinmeyen bir buton etkileşimi.',
                            ephemeral: true
                        });
                }
            } else if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'recent_searches') {
                    await handleSummonerSearch(interaction, interaction.values[0]);
                } else if (interaction.customId === 'recent_live_game_searches') {
                    await handleLiveGame(interaction, interaction.values[0]);
                }
            } else if (interaction.isModalSubmit()) {
                if (interaction.customId === 'summoner_search_modal') {
                    const summonerName = interaction.fields.getTextInputValue('summoner_name');
                    await handleSummonerSearch(interaction, summonerName);
                } else if (interaction.customId === 'live_game_modal') {
                    const summonerName = interaction.fields.getTextInputValue('summoner_name');
                    await handleLiveGame(interaction, summonerName);
                }
            }
        } catch (error) {
            console.error('Interaction Error:', error);
            try {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Hata')
                    .setDescription(`\`\`\`md\n# ${error.message || 'Beklenmeyen bir hata oluştu.'}\`\`\``)
                    .setTimestamp();

                if (interaction.deferred) {
                    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            } catch (replyError) {
                console.error('Reply Error:', replyError);
            }
        }
    },
};

// Modal gösterme fonksiyonu
async function showSearchModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('summoner_search_modal')
        .setTitle('Sihirdar Ara');

    const summonerInput = new TextInputBuilder()
        .setCustomId('summoner_name')
        .setLabel('Sihirdar Adı')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Kullanıcı#TAG formatında girin')
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(summonerInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
}

// Sihirdar arama işlemini handle eden fonksiyon
async function handleSummonerSearch(interaction, summonerName) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const summonerData = await riotApi.getSummonerByName(summonerName);
        const rankData = await riotApi.getRankedInfo(summonerData.id);

        // Arama geçmişine ekle
        searchHistory.addSearch(interaction.user.id, summonerData.riotId);

        // En yüksek rankı bul
        let highestRank = null;
        if (rankData && rankData.length > 0) {
            highestRank = rankData.reduce((prev, current) => {
                const ranks = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
                const prevIndex = ranks.indexOf(prev.tier);
                const currentIndex = ranks.indexOf(current.tier);
                return currentIndex > prevIndex ? current : prev;
            });
        }

        // Ana embed'i oluştur
        const embed = new EmbedBuilder()
            .setColor(highestRank ? RANK_COLORS[highestRank.tier] : '#0099ff')
            .setAuthor({ 
                name: summonerData.riotId,
                iconURL: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summonerData.profileIconId}.jpg`
            })
            .setThumbnail(highestRank ? RANK_ICONS[highestRank.tier] : RANK_ICONS.UNRANKED)
            .setDescription(
                `\`\`\`md\n` +
                `# Sihirdar Bilgileri\n` +
                `* Seviye: ${summonerData.summonerLevel}\n` +
                `* Son Görülme: ${new Date(summonerData.revisionDate).toLocaleString('tr-TR')}\n` +
                `\`\`\``
            );

        // Ranked bilgilerini ekle
        if (rankData && rankData.length > 0) {
            rankData.forEach(rank => {
                const queueEmoji = QUEUE_EMOJIS[rank.queueType] || '🎮';
                const queueType = rank.queueType === 'RANKED_SOLO_5x5' ? 'Solo/Duo' : 'Flex 5v5';
                const winRate = ((rank.wins / (rank.wins + rank.losses)) * 100).toFixed(1);
                const totalGames = rank.wins + rank.losses;

                embed.addFields({
                    name: `${queueEmoji} ${queueType}`,
                    value: `\`\`\`md\n` +
                          `# ${rank.tier} ${rank.rank}\n` +
                          `* LP: ${rank.leaguePoints}\n` +
                          `* Galibiyet: ${rank.wins} | Mağlubiyet: ${rank.losses}\n` +
                          `* Oran: ${winRate}% (${totalGames} Maç)\n` +
                          `\`\`\``,
                    inline: true
                });
            });

            // Boşluk için dummy field (2 sıralama varsa)
            if (rankData.length === 2) {
                embed.addFields({ name: '\u200b', value: '\u200b', inline: true });
            }

            // Genel istatistikler
            const totalWins = rankData.reduce((sum, rank) => sum + rank.wins, 0);
            const totalLosses = rankData.reduce((sum, rank) => sum + rank.losses, 0);
            const totalWinRate = ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1);

            embed.addFields({
                name: '📊 Sezon İstatistikleri',
                value: `\`\`\`md\n` +
                      `# Toplam ${totalWins + totalLosses} Maç\n` +
                      `* Galibiyet: ${totalWins}\n` +
                      `* Mağlubiyet: ${totalLosses}\n` +
                      `* Kazanma Oranı: ${totalWinRate}%\n` +
                      `\`\`\``,
                inline: false
            });
        } else {
            embed.addFields({
                name: '📊 Dereceli Bilgisi',
                value: `\`\`\`md\n# Bu sezon henüz dereceli oyun oynanmamış.\`\`\``,
                inline: false
            });
        }

        // Footer ekle
        embed.setFooter({ 
            text: `${interaction.user.tag} tarafından sorgulandı • League of Legends TR`, 
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

        // Yeni arama butonu ekle
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('search_summoner')
                    .setLabel('Yeni Arama')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔍')
            );

        await interaction.editReply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: true 
        });
    } catch (error) {
        console.error('Embed Error:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Hata')
            .setDescription(`\`\`\`md\n# ${error.message || 'Bir hata oluştu.'}\`\`\``)
            .setTimestamp();

        await interaction.editReply({ 
            embeds: [errorEmbed], 
            ephemeral: true 
        });
    }
} 

async function handleLiveGame(interaction, summonerName) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const summonerData = await riotApi.getSummonerByName(summonerName);
        const liveGameData = await riotApi.getLiveGame(summonerData.puuid);

        const gameMode = GAME_MODES[liveGameData.gameMode] || { emoji: '👥', name: 'Dereceli' };
        const gameDuration = `${Math.floor(liveGameData.gameLength / 60)}:${(liveGameData.gameLength % 60).toString().padStart(2, '0')}`;

        const embed = new EmbedBuilder()
            .setColor(TEAM_COLORS.BLUE)
            .setAuthor({ 
                name: `${summonerData.riotId} - Canlı Maç`,
                iconURL: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summonerData.profileIconId}.jpg`
            })
            .setDescription(
                `\`\`\`md\n` +
                `# Oyun Bilgileri\n` +
                `* Mod: ${gameMode.name}\n` +
                `* Süre: ${gameDuration}\n` +
                `* Başlangıç: ${new Date(liveGameData.gameStartTime).toLocaleTimeString('tr-TR')}\n` +
                `\`\`\``
            )
            .addFields(
                {
                    name: '🔵 Mavi Takım',
                    value: `\`\`\`md\n${formatTeamInfo(liveGameData.blueTeam)}\`\`\``,
                    inline: false
                },
                {
                    name: '🔴 Kırmızı Takım',
                    value: `\`\`\`md\n${formatTeamInfo(liveGameData.redTeam)}\`\`\``,
                    inline: false
                },
                {
                    name: '🚫 Yasaklanan Şampiyonlar',
                    value: formatBans(liveGameData.bannedChampions),
                    inline: false
                }
            )
            .setFooter({ 
                text: `${interaction.user.tag} tarafından sorgulandı • League of Legends TR`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        // Yeni arama butonu
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('search_summoner')
                    .setLabel('Yeni Arama')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔍')
            );

        await interaction.editReply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });

    } catch (error) {
        console.error('Live Game Error:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Hata')
            .setDescription(`\`\`\`md\n# ${error.message || 'Bir hata oluştu.'}\`\`\``)
            .setTimestamp();

        await interaction.editReply({ 
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
}

function formatTeamInfo(team) {
    return team.map(player => {
        const rankInfo = player.rankInfo.length > 0 
            ? player.rankInfo.find(r => r.queueType === 'RANKED_SOLO_5x5') || player.rankInfo[0]
            : null;

        const championName = CHAMPION_NAMES[player.championId] || `Şampiyon#${player.championId}`;
        const playerName = player.riotIdGameName.split('#')[0];
        
        let rankText = 'Derecesiz';
        let statsText = '';
        
        if (rankInfo) {
            const winRate = ((rankInfo.wins / (rankInfo.wins + rankInfo.losses)) * 100).toFixed(0);
            const totalGames = rankInfo.wins + rankInfo.losses;
            rankText = `${rankInfo.tier} ${rankInfo.rank}`;
            statsText = ` • ${winRate}% (${totalGames})`;
        }

        return `# ${playerName} (${championName}) | ${rankText}${statsText}`;
    }).join('\n');
}

function formatBans(bans) {
    const formatTeamBans = (teamBans) => {
        return teamBans
            .map(ban => CHAMPION_NAMES[ban.championId] || 'Bilinmeyen')
            .filter(name => name !== 'Bilinmeyen')
            .join(', ');
    };

    const blueBans = formatTeamBans(bans.blue);
    const redBans = formatTeamBans(bans.red);

    return `\`\`\`md\n# Mavi Takım\n${blueBans || 'Ban yok'}\n\n# Kırmızı Takım\n${redBans || 'Ban yok'}\`\`\``;
} 

// Modal gösterme fonksiyonlarını ayır
async function showLiveGameModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('live_game_modal')
        .setTitle('Canlı Maç Ara');

    const summonerInput = new TextInputBuilder()
        .setCustomId('summoner_name')
        .setLabel('Sihirdar Adı')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Kullanıcı#TAG formatında girin')
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(summonerInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
} 