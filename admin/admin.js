const { SlashCommandBuilder } = require('discord.js');
const stop = require('./stop');
const restart = require('./restart')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('bot管理用コマンド')
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('botを停止します'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('restart')
                .setDescription('botを再起動します')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'stop') {
            return stop.execute(interaction);
        } else if (subcommand === 'restart') {
            return restart.execute(interaction);
        }
    },
};