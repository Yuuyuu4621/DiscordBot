const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'stop',
        description: 'botを停止します',
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '権限がありません', ephemeral: true });
        }

        await interaction.reply('Botを停止します...');
        console.log('Botが停止されます...');
        process.exit(0);
    },
};