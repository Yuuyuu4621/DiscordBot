const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('サーバーから指定したユーザーをキックします')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('対象ユーザー')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('理由')
                .setRequired(false)),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'メンバーをキックする権限がありません。', ephemeral: true });
        }

        const targetUser = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || '指定なし';
        const executor = interaction.user.tag;

        if (!targetUser) {
            return interaction.reply({ content: 'そのユーザーは存在しません。', ephemeral: true });
        }

        await targetUser.kick(`${reason} - 実行: ${executor}`);
        await interaction.reply(`${targetUser.user.tag} はキックされました。理由: ${reason}`);
    },
};