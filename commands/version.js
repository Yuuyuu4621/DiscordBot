const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('version')
        .setDescription('バージョンを表示します'),
    
    async execute(interaction) {
        await interaction.reply('バージョン : β0.1');
    },
};