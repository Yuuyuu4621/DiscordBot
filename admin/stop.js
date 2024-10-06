const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'stop',
        description: 'botを停止します',
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await interaction.reply({ content: 'Botを停止します。'});
                client.destroy();
                console.log('Botが停止しました');
            }
        },
    };