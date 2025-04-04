require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildIds = process.env.GUILD_ID.split(',');
const webhookUrl = process.env.WEBHOOK_URL;
const logChannelId = process.env.LOGCHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Message, Partials.Channel, Partials.GuildMember] });

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

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === 'おはよう') {
        message.reply({
            content: `${message.author.username} さん、おはよう`,
            allowedMentions: { repliedUser: false }
        });
    }

    if (message.content === 'こんばんは') {
        message.reply({
            content: `${message.author.username} さん、こんばんは`,
            allowedMentions: { repliedUser: false }
        });
    }
});
const adminCommand = require('./admin/admin');
const roleCommand = require('./modules/function/role/role');
const kickCommand = require('./modules/function/punishment/kick');
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

client.on('voiceStateUpdate', async (oldState, newState) => {
    const targetUserId = '892335593118392341';
    const notifyChannelId = '1307312291103903775';

    if (newState.member?.id === targetUserId && !oldState.channelId && newState.channelId) {
        try {
            const notifyChannel = await client.channels.fetch(notifyChannelId);
            if (!notifyChannel?.isTextBased()) {
                console.error('通知先チャンネルがテキストチャンネルではありません。');
                return;
            }

            await notifyChannel.send(`ゆうゆう さんが VC に参加しました！`);
            console.log(`ユーザー ゆうゆう の VC 参加を通知しました。`);
        } catch (error) {
            console.error('VC 参加通知中にエラーが発生しました:', error);
        }
    }
});


client.once('ready', async() => {
    console.log(`${client.user.tag} がログインしました`);

    try {
        const logChannel = await client.channels.fetch(logChannelId);
        if (!logChannel?.isTextBased()) {
            console.error('ログチャンネルが見つからない、またはテキストチャンネルではありません。');
            return;
        }

        const webhooks = await logChannel.fetchWebhooks();
        logWebhook = webhooks.find(wh => wh.name === 'Yuuyuu4621 General_Manager LogSystem');

        if (!logWebhook) {
            logWebhook = await logChannel.createWebhook({
                name: 'Yuuyuu4621 General_Manager LogSystem',
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

const targetUserId = process.env.REACTION_ID;
const reactionEmoji = '🔪';

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.author.id === targetUserId) {
        try {
            await message.react(reactionEmoji);
            console.log(`リアクションを付けました: ${message.content}`);
        } catch (error) {
            console.error('リアクションの追加に失敗しました:', error);
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.includes('いそかぜ')) {
        try {
            await message.react(reactionEmoji);
            console.log(`リアクションを付けました: ${message.content}`);
        } catch (error) {
            console.error('リアクションの追加に失敗しました:', error);
        }
    }
});

const messageLinkRegex = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const match = message.content.match(messageLinkRegex);
    if (match) {
        const [_, guildId, channelId, messageId] = match;

        try {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);
            const targetMessage = await channel.messages.fetch(messageId);

            await message.reply({
                content: `**${targetMessage.author.username} のメッセージ:**\n${targetMessage.content}`, allowedMentions: { repliedUser: false }
            });
        } catch (error) {
            console.error('メッセージの取得に失敗しました:', error);
            await message.reply('メッセージを取得できませんでした。権限が不足している可能性があります。');
        }
    }
});

client.login(token).catch(error => {
    console.error('ボットのログイン中にエラーが発生しました:', error);
    sendErrorToWebhook(error);
});