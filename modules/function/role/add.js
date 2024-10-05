const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'add',
        description: 'ユーザーにロールを追加します',
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'メンバーのロールを変更する権限がありません。', ephemeral: true });
        }

        const targetUser = interaction.options.getMember('user');
        const targetRole = interaction.options.getRole('role');

        if (targetUser.roles.cache.has(targetRole.id)) {
            return interaction.reply({ content: 'このユーザーは既にそのロールを持っています。', ephemeral: true });
        }

        await targetUser.roles.add(targetRole);
        await interaction.reply(`${targetUser.user.tag} にロール ${targetRole.name} を追加しました。`);
    },
};