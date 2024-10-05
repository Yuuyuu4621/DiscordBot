const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('管理コマンド')
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('botを停止します')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (interaction.commandName === 'admin' && interaction.options.getSubcommand() === 'stop') {
            try {
                // ボットが停止する前に返信を送る
                await interaction.reply({ content: 'Botを停止します。', ephemeral: true });
                client.destroy();
                console.log('Botが停止しました');
            } catch (error) {
                console.error('Botの停止中にエラーが発生しました:', error);
                await interaction.reply({ content: 'Botの停止中にエラーが発生しました。', ephemeral: true });
            }
        }        
    },
};