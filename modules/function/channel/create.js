const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'create',
        description: 'チャンネルを作成します',
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {            return interaction.reply({ content: 'メンバーのロールを変更する権限がありません。', ephemeral: true });
        }

        const channelName = interaction.options.targetRole('name');

        if (channelName.channel.cache.has(channelName.name)) {
            return interaction.reply({ content: 'このチャンネル名は既に存在します', ephemeral: true });
        }

        await channel.create(channelName);
        await interaction.reply(`${targetUser.user.tag} にロール ${targetRole.name} を追加しました。`);    
    },
};