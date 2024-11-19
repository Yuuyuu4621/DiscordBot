const fetch = require('node-fetch');

module.exports = {
    name: 'messageUpdate',
    async execute(client, oldMessage, newMessage, webhookUrl) {
        if (oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

        const embed = {
            title: 'メッセージが編集されました',
            color: 0xFFFF00,
            fields: [
                { name: '送信者', value: `${oldMessage.author.tag}`, inline: true },
                { name: 'チャンネル', value: `<#${oldMessage.channel.id}>`, inline: true },
                { name: '元の内容', value: oldMessage.content || '内容なし' },
                { name: '編集後の内容', value: newMessage.content || '内容なし' }
            ],
            timestamp: new Date().toISOString()
        };

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] }),
            });
        } catch (error) {
            console.error('Webhookへの送信に失敗しました:', error);
        }
    },
};
