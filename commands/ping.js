module.exports = {
    name: 'ping',
    description: 'pingを送信します',
    async execute(interaction) {
        await interaction.reply('Pong');
    },
};