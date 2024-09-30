require('dotenv').config();  // .envファイルを読み込む
const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // WebhookにPOSTするためのモジュール

// 環境変数から値を取得
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const webhookUrl = process.env.WEBHOOK_URL; // Webhook URLを取得

// Discordクライアントの作成
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// スラッシュコマンドを登録する
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
        name: 'kick',
        description: 'サーバーから指定したユーザーをキックします',
        options: [
            {
                name: 'user',
                description: '対象ユーザー',
                type: 6, // USER type
                required: true,
            },
            {
                name: 'reason',
                description: '理由',
                type: 3, // STRING type
                required: false,
            }
        ],
    }
];

// REST APIを使ってコマンドをDiscordに登録
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
        await sendErrorToWebhook(error); // エラーをWebhookに送信
    }
})();

// ボットが起動したときの処理
client.once('ready', () => {
    console.log(`${client.user.tag} がログインしました`);
});

// エラーメッセージをWebhookに送信する関数
const sendErrorToWebhook = async (error) => {
    const embed = new EmbedBuilder()
        .setTitle('エラーが発生しました')
        .setColor(0xFF0000) // REDの16進数値を指定
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

// コマンドの実行処理
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'ping') {
            await interaction.reply('Pong');
        } else if (commandName === 'version') {
            await interaction.reply('バージョン : β1.0');
        } else if (commandName === 'kick') {
            // 「メンバーをキック」の権限があるか確認
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return interaction.reply({ content: 'メンバーをキックする権限がありません。', ephemeral: true });
            }

            // キックする対象のユーザーと理由を取得
            const targetUser = interaction.options.getMember('user');
            const reason = interaction.options.getString('reason') || '指定なし';
            const executor = interaction.user.tag;

            if (!targetUser) {
                return interaction.reply({ content: 'そのユーザーは存在しません。', ephemeral: true });
            }

            // キック実行
            await targetUser.kick(`${reason} - 実行: ${executor}`);
            await interaction.reply(`${targetUser.user.tag} はキックされました。理由: ${reason}`);
        }
    } catch (error) {
        // Missing Permissionsエラーを特定
        if (error.code === 50013) {
            await interaction.reply({ content: '権限がありません。', ephemeral: true });
        } else {
            console.error('コマンド実行中にエラーが発生しました:', error);
            await sendErrorToWebhook(error); // エラーをWebhookに送信
            await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
        }
    }
});

// ボットにログイン
client.login(token).catch(error => {
    console.error('ボットのログイン中にエラーが発生しました:', error);
    sendErrorToWebhook(error); // ログインエラーをWebhookに送信
});