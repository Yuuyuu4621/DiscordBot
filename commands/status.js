const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('botのステータスを表示します'),
    
    async execute(interaction) {
        await interaction.reply('ステータス : 正常に起動中');
    },
};