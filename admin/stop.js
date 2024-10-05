const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'stop',
        description: 'botを停止します',
    },
    async execute(interaction) {
        if (interaction.commandName === 'admin' && interaction.options.getSubcommand() === 'stop') {
                await interaction.reply({ content: 'Botを停止します。', ephemeral: true });
                client.destroy();
                console.log('Botが停止しました');
            }
        },
    };