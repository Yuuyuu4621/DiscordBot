const { SlashCommandBuilder } = require('discord.js');
const channeladd = require('./create');
const channelremove = require('./delete');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('チャンネルを追加または削除します')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('チャンネルを作成します')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('チャンネル名')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('カテゴリー')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('チャンネルを削除します')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('削除するチャンネル')
                        .setRequired(true))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'create') {
            return channeladd.execute(interaction);
        } else if (subcommand === 'delete') {
            return channelremove.execute(interaction);
        }
    },
};