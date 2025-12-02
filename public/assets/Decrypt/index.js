const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const { registerCommands } = require('./src/modules/commands');
const { handleInteraction } = require('./src/modules/handlers');
const { cleanOldBackups } = require('./src/modules/backup');
const DiscordLogger = require('./src/modules/discord-logger');
const { checkVouchStatus } = require('./src/modules/vouch');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 FiveCFX Decrypt Bot - Main Entry Point
// Website: https://fivecfx.com
// Discord: https://discord.fivecfx.com
// ═══════════════════════════════════════════════════════════════════════════

async function initializeApplication() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║          🔥 FiveCFX Decrypt Bot - Starting Up 🔥           ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    console.log('📌 Website: https://fivecfx.com');
    console.log('💬 Discord: https://discord.fivecfx.com\n');

    // Start Web Server
    const { startServer } = require('./src/server');
    await startServer();

    // Start API Server
    const { startApiServer } = require('./src/api/api-server');
    await startApiServer();

    // Register Discord commands
    await registerCommands();

    // Clean old backups (30 days retention)
    cleanOldBackups(30);

    client.on('ready', async() => {
        console.log(`✅ Discord Bot logged in as ${client.user.tag}`);
        global.discordLogger = new DiscordLogger(client);
        global.discordClient = client;
        
        // Scan existing vouches
        const { scanVouchChannel } = require('./src/modules/vouch');
        console.log('🔍 Scanning vouch channel for existing vouches...');
        await scanVouchChannel(client);
        
        // Start vouch monitoring
        setInterval(() => checkVouchStatus(client), 60000);
    });

    client.on('interactionCreate', async(interaction) => {
        try {
            await handleInteraction(interaction, client);
        } catch (error) {
            console.error('❌ Error handling interaction:', error);
        }
    });

    client.on('messageCreate', async(message) => {
        try {
            const { VOUCH_CHANNEL_ID, addVouch } = require('./src/modules/vouch');
            if (message.channelId === VOUCH_CHANNEL_ID && !message.author.bot) {
                addVouch(message.author.id, message.id);
                console.log(`✅ New vouch from ${message.author.tag}`);
            }
        } catch (error) {
            console.error('❌ Error handling message create:', error);
        }
    });

    client.on('messageDelete', async(message) => {
        try {
            const { handleVouchDelete } = require('./src/modules/vouch');
            await handleVouchDelete(message, client);
        } catch (error) {
            console.error('❌ Error handling message delete:', error);
        }
    });

    client.on('error', (error) => {
        console.error('❌ Discord client error:', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    await client.login(config.discord.token);
}

global.discordLogger = null;

initializeApplication().catch(console.error);
