require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const webhookUrl = process.env.WEBHOOK_URL;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
    {
        name: 'ping',
        description: 'pingを送信します',
    },
    {
        name: 'version',
        description: 'バージョンを表示します',
    },
    {
        name: 'status',
        description: 'botのステータスを表示します',
    },
    {
        name: 'kick',
        description: 'サーバーから指定したユーザーをキックします',
        options: [
            {
                name: 'user',
                description: '対象ユーザー',
                type: 6,
                required: true,
            },
            {
                name: 'reason',
                description: '理由',
                type: 3,
                required: false,
            },
        ],
    },
    {
        name: 'role',
        description: 'ユーザーにロールを追加または削除します',
        options: [
            {
                name: 'add',
                description: 'ユーザーにロールを追加します',
                type: 1,
                options: [
                    {
                        name: 'user',
                        description: '対象ユーザー',
                        type: 6,
                        required: true,
                    },
                    {
                        name: 'role',
                        description: '追加するロール',
                        type: 8,
                        required: true,
                    },
                ],
            },
            {
                name: 'remove',
                description: 'ユーザーからロールを削除します',
                type: 1,
                options: [
                    {
                        name: 'user',
                        description: '対象ユーザー',
                        type: 6,
                        required: true,
                    },
                    {
                        name: 'role',
                        description: '削除するロール',
                        type: 8,
                        required: true,
                    },
                ],
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('アプリケーションコマンドの再読み込みを開始しました');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log('アプリケーションコマンドの再読み込みに成功しました');
    } catch (error) {
        console.error('コマンドの再読み込み中にエラーが発生しました:', error);
        await sendErrorToWebhook(error);
    }
})();

client.once('ready', () => {
    console.log(`${client.user.tag} がログインしました`);
});

const sendErrorToWebhook = async (error) => {
    const embed = new EmbedBuilder()
        .setTitle('エラーが発生しました')
        .setColor(0xFF0000)
        .setDescription(`\`\`\`${error.message}\`\`\``)
        .setTimestamp();

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] }),
        });
    } catch (webhookError) {
        console.error('Webhookへの送信に失敗しました:', webhookError);
    }
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'ping') {
            await interaction.reply('Pong'); }

          else if (commandName === 'version') {
            await interaction.reply('バージョン : β0.1'); }

          else if (commandName === 'status') {
            await interaction.reply('ステータス : 正常に起動中'); }

          else if (commandName === 'kick') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return interaction.reply({ content: 'メンバーをキックする権限がありません。', ephemeral: true });
            }
            const targetUser = interaction.options.getMember('user');
            const reason = interaction.options.getString('reason') || '指定なし';
            const executor = interaction.user.tag;
            if (!targetUser) {
                return interaction.reply({ content: 'そのユーザーは存在しません。', ephemeral: true });
            }
            // キック実行
            await targetUser.kick(`${reason} - 実行: ${executor}`);
            await interaction.reply(`${targetUser.user.tag} はキックされました。理由: ${reason}`); }

          else if (commandName === 'role') {
            const subcommand = interaction.options.getSubcommand();
            const targetUser = interaction.options.getMember('user');
            const targetRole = interaction.options.getRole('role');

            if (subcommand === 'add') {
                if (targetUser.roles.cache.has(targetRole.id)) {
                    return interaction.reply({ content: 'このユーザーは既にそのロールを持っています。', ephemeral: true });
                }
                await targetUser.roles.add(targetRole);
                await interaction.reply(`${targetUser.user.tag} にロール ${targetRole.name} を追加しました。`); }

              else if (subcommand === 'remove') {
                if (!targetUser.roles.cache.has(targetRole.id)) {
                    return interaction.reply({ content: 'このユーザーはそのロールを持っていません。', ephemeral: true });
                }
                await targetUser.roles.remove(targetRole);
                await interaction.reply(`${targetUser.user.tag} からロール ${targetRole.name} を削除しました。`); }
        }
    } catch (error) {
        if (error.code === 50013) {
            await interaction.reply({ content: '権限がありません。', ephemeral: true });
        } else {
            console.error('コマンド実行中にエラーが発生しました:', error);
            await sendErrorToWebhook(error);
            await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
        }
    }
});

client.login(token).catch(error => {
    console.error('ボットのログイン中にエラーが発生しました:', error);
    sendErrorToWebhook(error);
});