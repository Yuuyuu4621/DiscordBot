const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pingを送信します'),
    
    async execute(interaction) {
        await interaction.reply('Pong');
    },
};