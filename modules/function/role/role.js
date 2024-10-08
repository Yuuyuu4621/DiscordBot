const { SlashCommandBuilder } = require('discord.js');
const roleadd = require('./add');
const roleremove = require('./remove');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('ユーザーにロールを追加または削除します')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('ユーザーにロールを追加します')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('対象ユーザー')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('追加するロール')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('ユーザーからロールを削除します')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('対象ユーザー')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('削除するロール')
                        .setRequired(true))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'add') {
            return roleadd.execute(interaction);
        } else if (subcommand === 'remove') {
            return roleremove.execute(interaction);
        }
    },
};