const { SlashCommandBuilder } = require('discord.js');
const roleAdd = require('./roleadd');
const roleRemove = require('./roleremove');

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
            return roleAdd.execute(interaction);
        } else if (subcommand === 'remove') {
            return roleRemove.execute(interaction);
        }
    },
};