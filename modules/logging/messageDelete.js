const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    async execute(client, message, logChannelId) {
        if (message.author?.bot) return;

        const logChannel = await client.channels.fetch(logChannelId).catch(console.error);
        if (!logChannel?.isTextBased()) return;

        const embed = new EmbedBuilder()
            .setTitle('メッセージが削除されました')
            .setColor(0xFF0000)
            .addFields(
                { name: '送信者', value: `${message.author.tag}`, inline: true },
                { name: 'チャンネル', value: `<#${message.channel.id}>`, inline: true },
                { name: '内容', value: message.content || '内容なし' }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(console.error);
    },
};
