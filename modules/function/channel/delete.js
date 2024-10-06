const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'delete',
        description: 'チャンネルを削除します',
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'チャンネルを削除する権限がありません。', ephemeral: true });
        }

        const targetChannel = interaction.options.getChannel('channel');

        if (!targetChannel) {
            return interaction.reply({ content: '指定されたチャンネルが存在しません。', ephemeral: true });
        }

        await targetChannel.delete();

        return interaction.reply({ content: `チャンネル ${targetChannel.name} が削除されました。`, ephemeral: true });
    },
};