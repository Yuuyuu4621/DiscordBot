const { PermissionsBitField } = require('discord.js');
const { spawn } = require('child_process');

module.exports = {
    data: {
        name: 'restart',
        description: 'botを再起動します',
    },
    async execute(interaction) {
        // 管理者権限のチェック
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'このコマンドを実行する権限がありません。',
                ephemeral: true
            });
        }

        // 再起動通知
        await interaction.reply('Botを再起動します...');
        console.log('Botが再起動されます...');

        // 再起動処理
        const child = spawn(process.argv[0], process.argv.slice(1), {
            cwd: process.cwd(), // 現在の作業ディレクトリ
            detached: true,     // 子プロセスを親から独立させる
            stdio: 'inherit',   // 標準出力を引き継ぐ
        });

        child.unref(); // 子プロセスを親から切り離す

        process.exit(0); // 現在のプロセスを終了
    },
};