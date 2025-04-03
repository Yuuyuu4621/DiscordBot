const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jikosyokai')
        .setDescription('自己紹介をします')
        .addStringOption(option =>
            option.setName('名前')
                .setDescription('自分の名前')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('好きなこと')
                .setDescription('ゲームや読書など')
                .setRequired(true)),
    
    async execute(interaction) {
        const name = interaction.options.getString('名前');
        const hobby = interaction.options.getString('好きなこと');

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('📝 自己紹介')
            .addFields(
                { name: '👤 名前', value: name, inline: true },
                { name: '🎯 好きなこと', value: hobby, inline: true }
            )
            .setFooter({ text: `紹介者: ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
