const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'create',
        description: 'チャンネルを作成します',
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'チャンネルを作成する権限がありません。', ephemeral: true });
        }

        const channelName = interaction.options.getString('name');
        const category = interaction.options.getChannel('category');

        const existingChannel = interaction.guild.channels.cache.find(channel => channel.name === channelName);
        if (existingChannel) {
            return interaction.reply({ content: 'そのチャンネル名は既に存在します。', ephemeral: true });
        }

        const createdChannel = await interaction.guild.channels.create({
            name: channelName,
            type: 0,
            parent: category ? category.id : null,
        });

        return interaction.reply({ content: `チャンネル ${createdChannel.name} が作成されました。`, ephemeral: true });
    },
};