const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(client, oldMessage, newMessage, logChannelId) {
        if (oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

        const logChannel = await client.channels.fetch(logChannelId).catch(console.error);
        if (!logChannel?.isTextBased()) return;

        const embed = new EmbedBuilder()
            .setTitle('メッセージが編集されました')
            .setColor(0xFFFF00)
            .addFields(
                { name: '送信者', value: `${oldMessage.author.tag}`, inline: true },
                { name: 'チャンネル', value: `<#${oldMessage.channel.id}>`, inline: true },
                { name: '元の内容', value: oldMessage.content || '内容なし' },
                { name: '編集後の内容', value: newMessage.content || '内容なし' }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(console.error);
    },
};
