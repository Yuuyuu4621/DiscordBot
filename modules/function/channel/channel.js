const { SlashCommandBuilder } = require('discord.js');
const roleadd = require('./create');
const roleremove = require('./delete');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('チャンネルを追加または削除します')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('チャンネルを作成します')
                .addUserOption(option =>
                    option.setName('name')
                        .setDescription('チャンネル名')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('チャンネルを削除します')
                .addUserOption(option =>
                    option.setName('channel')
                        .setDescription('対象チャンネル')
                        .setRequired(true))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'create') {
            return roleadd.execute(interaction);
        } else if (subcommand === 'delete') {
            return roleremove.execute(interaction);
        }
    },
};