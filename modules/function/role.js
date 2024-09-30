const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

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
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'メンバーのロールを変更する権限がありません。', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getMember('user');
        const targetRole = interaction.options.getRole('role');

        if (subcommand === 'add') {
            if (targetUser.roles.cache.has(targetRole.id)) {
                return interaction.reply({ content: 'このユーザーは既にそのロールを持っています。', ephemeral: true });
            }
            await targetUser.roles.add(targetRole);
            await interaction.reply(`${targetUser.user.tag} にロール ${targetRole.name} を追加しました。`);

        } else if (subcommand === 'remove') {
            if (!targetUser.roles.cache.has(targetRole.id)) {
                return interaction.reply({ content: 'このユーザーはそのロールを持っていません。', ephemeral: true });
            }
            await targetUser.roles.remove(targetRole);
            await interaction.reply(`${targetUser.user.tag} からロール ${targetRole.name} を削除しました。`);
        }
    },
};