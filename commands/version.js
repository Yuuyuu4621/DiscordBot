module.exports = {
    name: 'version',
    description: 'バージョンを表示します',
    async execute(interaction) {
        await interaction.reply('バージョン : β0.1');
    },
};