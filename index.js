require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildIds = process.env.GUILD_ID.split(',');
const webhookUrl = process.env.WEBHOOK_URL;

const logChannelId = '1284147765756039179';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const commands = [];

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && command.data.toJSON) {
        commands.push(command);
    } else {
        console.error(`コマンド ${file} に問題があります: dataが正しく設定されていません。`);
    }
}

const logModules = [];

const logFiles = fs.readdirSync(path.join(__dirname, 'modules/logging')).filter(file => file.endsWith('.js'));
for (const file of logFiles) {
    const logModule = require(`./modules/logging/${file}`);
    if (logModule.name && logModule.execute) {
        logModules.push(logModule);
    } else {
        console.error(`ログモジュール ${file} に問題があります。`);
    }
}

let logWebhook;

client.on('messageDelete', async (message) => {
    const module = logModules.find(mod => mod.name === 'messageDelete');
    if (module && logWebhook) {
        await module.execute(client, message, logWebhook.url);
    }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    const module = logModules.find(mod => mod.name === 'messageUpdate');
    if (module && logWebhook) {
        await module.execute(client, oldMessage, newMessage, logWebhook.url);
    }
});

const adminCommand = require('./admin/admin');
const roleCommand = require('./modules/function/role/role');
const kickCommand = require('./modules/function/kick');
const channelCommand = require('./modules/function/channel/channel');
commands.push(roleCommand, kickCommand, adminCommand, channelCommand);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('アプリケーションコマンドの再読み込みを開始しました');

        for (const guildId of guildIds) {
            const existingCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId.trim()));

            for (const command of existingCommands) {
                const commandExists = commands.some(cmd => cmd.data.name === command.name);
                if (!commandExists) {
                    console.log(`コマンド ${command.name} を削除します`);
                    try {
                        await rest.delete(Routes.applicationCommand(clientId, guildId.trim(), command.id));
                    } catch (deleteError) {
                        if (deleteError.code === 10063) {
                            console.warn(`コマンド ${command.name} は既に削除されています: ${deleteError.message}`);
                        } else {
                            console.error(`コマンド ${command.name} の削除中にエラーが発生しました:`, deleteError);
                        }
                    }
                }
            }

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId.trim()),
                { body: commands.map(command => command.data.toJSON()) }
            );

            console.log(`ギルド ${guildId.trim()} にコマンドが正常に登録されました`);
        }

        console.log('アプリケーションコマンドの再読み込みに成功しました');
    } catch (error) {
        console.error('コマンドの再読み込み中にエラーが発生しました:', error);
        await sendErrorToWebhook(error);
    }
})();

client.once('ready', async() => {
    console.log(`${client.user.tag} がログインしました`);

    try {
        const logChannel = await client.channels.fetch(logChannelId);
        if (!logChannel?.isTextBased()) {
            console.error('ログチャンネルが見つからない、またはテキストチャンネルではありません。');
            return;
        }

        const webhooks = await logChannel.fetchWebhooks();
        logWebhook = webhooks.find(wh => wh.name === 'タムタムん家_ログシステム');

        if (!logWebhook) {
            logWebhook = await logChannel.createWebhook({
                name: 'タムタムん家_ログシステム',
                avatar: client.user.displayAvatarURL(),
            });
            console.log('webhookの作成に成功しました');
        }
    } catch (error) {
        console.error('webhookの取得または作成に失敗しました', error);
    }
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
    const command = commands.find(cmd => cmd.data.name === commandName);

    if (command) {
        try {
            await command.execute(interaction, client);
        } catch (error) {
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