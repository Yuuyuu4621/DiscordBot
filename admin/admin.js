const { SlashCommandBuilder } = require('discord.js');
const stop = require('./stop');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('bot管理用コマンド')
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('botを停止します')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'stop') {
            return stop.execute(interaction);
        }
    },
};