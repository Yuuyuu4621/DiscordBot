// modules/function/role/roleremove.js
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'roleremove',
        description: 'ユーザーからロールを削除します',
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'メンバーのロールを変更する権限がありません。', ephemeral: true });
        }

        const targetUser = interaction.options.getMember('user');
        const targetRole = interaction.options.getRole('role');

        if (!targetUser.roles.cache.has(targetRole.id)) {
            return interaction.reply({ content: 'このユーザーはそのロールを持っていません。', ephemeral: true });
        }

        await targetUser.roles.remove(targetRole);
        await interaction.reply(`${targetUser.user.tag} からロール ${targetRole.name} を削除しました。`);
    },
};