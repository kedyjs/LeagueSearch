require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Events handler
const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Ana menüyü göstermek için komut
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content === '!menu') {
        const MainMenu = require('./src/interfaces/mainMenu');
        const menuData = await MainMenu.create();
        await message.channel.send(menuData);
    }
});

client.login(process.env.DISCORD_TOKEN); 