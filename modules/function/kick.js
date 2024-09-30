const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'サーバーから指定したユーザーをキックします',
    options: [
        {
            name: 'user',
            description: '対象ユーザー',
            type: 6,
            required: true,
        },
        {
            name: 'reason',
            description: '理由',
            type: 3,
            required: false,
        },
    ],
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'メンバーをキックする権限がありません。', ephemeral: true });
        }

        const targetUser = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || '指定なし';
        const executor = interaction.user.tag;

        if (!targetUser) {
            return interaction.reply({ content: 'そのユーザーは存在しません。', ephemeral: true });
        }

        // キック実行
        await targetUser.kick(`${reason} - 実行: ${executor}`);
        await interaction.reply(`${targetUser.user.tag} はキックされました。理由: ${reason}`);
    },
};