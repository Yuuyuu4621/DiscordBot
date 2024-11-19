const fetch = require('node-fetch');

module.exports = {
    name: 'messageDelete',
    async execute(client, message, webhookUrl) {
        if (message.author?.bot) return;

        const embed = {
            title: 'メッセージが削除されました',
            color: 0xFF0000,
            fields: [
                { name: '送信者', value: `${message.author.tag}`, inline: true },
                { name: 'チャンネル', value: `<#${message.channel.id}>`, inline: true },
                { name: '内容', value: message.content || '内容なし' }
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
