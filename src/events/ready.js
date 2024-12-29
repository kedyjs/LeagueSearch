const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`${client.user.tag} olarak giriş yapıldı!`);
        console.log(`Bot ${client.guilds.cache.size} sunucuda aktif!`);
        
        // Bot durumunu ayarla
        client.user.setPresence({
            activities: [{ 
                name: '!menu | League of Legends',
                type: 3 // WATCHING
            }],
            status: 'online'
        });
    },
}; 