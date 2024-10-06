require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildIds = process.env.GUILD_ID.split(',');
const webhookUrl = process.env.WEBHOOK_URL;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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