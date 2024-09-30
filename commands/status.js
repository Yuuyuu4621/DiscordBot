module.exports = {
    name: 'status',
    description: 'botのステータスを表示します',
    async execute(interaction) {
        await interaction.reply('ステータス : 正常に起動中');
    },
};