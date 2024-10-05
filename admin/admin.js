const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const adminstop = require('./stop');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('管理コマンド')
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('botを停止します')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'stop') {
            return adminstop.execute(interaction);
        }     
    },
};