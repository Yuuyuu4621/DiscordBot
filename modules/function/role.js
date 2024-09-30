module.exports = {
    name: 'role',
    description: 'ユーザーにロールを追加または削除します',
    options: [
        {
            name: 'add',
            description: 'ユーザーにロールを追加します',
            type: 1,
            options: [
                {
                    name: 'user',
                    description: '対象ユーザー',
                    type: 6,
                    required: true,
                },
                {
                    name: 'role',
                    description: '追加するロール',
                    type: 8,
                    required: true,
                },
            ],
        },
        {
            name: 'remove',
            description: 'ユーザーからロールを削除します',
            type: 1,
            options: [
                {
                    name: 'user',
                    description: '対象ユーザー',
                    type: 6,
                    required: true,
                },
                {
                    name: 'role',
                    description: '削除するロール',
                    type: 8,
                    required: true,
                },
            ],
        },
    ],
    async execute(interaction) {
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