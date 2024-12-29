const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

class MainMenu {
    static async create() {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('League of Legends Arama Sistemi')
            .setDescription('Aşağıdaki butonları kullanarak işlem yapabilirsiniz.')
            .addFields(
                { name: '🔍 Sihirdar Ara', value: 'Sihirdar bilgilerini görüntüle' },
                { name: '📊 Canlı Maç', value: 'Aktif oyun bilgilerini görüntüle' },
                { name: '📈 Sıralama', value: 'Sıralama bilgilerini görüntüle' },
                { name: '🏆 Buildler', value: 'Şampiyon buildlerini görüntüle' }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('search_summoner')
                    .setLabel('Sihirdar Ara')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔍'),
                new ButtonBuilder()
                    .setCustomId('live_game')
                    .setLabel('Canlı Maç')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📊'),
                new ButtonBuilder()
                    .setCustomId('rankings')
                    .setLabel('Sıralama')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📈'),
                new ButtonBuilder()
                    .setCustomId('builds')
                    .setLabel('Buildler')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🏆')
            );

        return {
            embeds: [embed],
            components: [row]
        };
    }
}

module.exports = MainMenu; 