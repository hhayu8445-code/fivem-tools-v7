const fs = require('fs');
const path = require('path');
const config = require('../../config');

const VOUCH_CHANNEL_ID = config.discord.vouchChannelId;
const VOUCH_FILE = path.join(__dirname, '..', 'database', 'vouches.json');

function loadVouches() {
    try {
        if (fs.existsSync(VOUCH_FILE)) {
            return JSON.parse(fs.readFileSync(VOUCH_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading vouches:', error);
    }
    return {};
}

function saveVouches(data) {
    try {
        fs.writeFileSync(VOUCH_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving vouches:', error);
        return false;
    }
}

async function scanVouchChannel(client) {
    try {
        const channel = await client.channels.fetch(VOUCH_CHANNEL_ID);
        if (!channel) return;

        const messages = await channel.messages.fetch({ limit: 100 });
        const vouches = loadVouches();
        let updated = false;

        messages.forEach(msg => {
            if (msg.author.bot) return;
            
            const userId = msg.author.id;
            if (!vouches[userId]) {
                vouches[userId] = {
                    messageId: msg.id,
                    timestamp: msg.createdAt.toISOString(),
                    content: msg.content
                };
                updated = true;
                console.log(`✅ Found vouch for ${msg.author.tag} (${userId})`);
            }
        });

        if (updated) {
            saveVouches(vouches);
            console.log(`📝 Total vouches: ${Object.keys(vouches).length}`);
        }
    } catch (error) {
        console.error('Error scanning vouch channel:', error);
    }
}

function hasVouch(userId) {
    const vouches = loadVouches();
    return vouches[userId] && vouches[userId].messageId;
}

function addVouch(userId, messageId) {
    const vouches = loadVouches();
    vouches[userId] = {
        messageId,
        timestamp: new Date().toISOString()
    };
    return saveVouches(vouches);
}

function removeVouch(userId) {
    const vouches = loadVouches();
    delete vouches[userId];
    return saveVouches(vouches);
}

function getVouchMessageId(userId) {
    const vouches = loadVouches();
    return vouches[userId]?.messageId || null;
}

async function checkVouchStatus(client) {
    const vouches = loadVouches();
    const vouchChannel = await client.channels.fetch(VOUCH_CHANNEL_ID).catch(() => null);
    
    if (!vouchChannel) return;

    for (const [userId, data] of Object.entries(vouches)) {
        try {
            const message = await vouchChannel.messages.fetch(data.messageId).catch(() => null);
            if (!message) {
                console.log(`Vouch message deleted for user ${userId}, banning...`);
                await banUserForVouchDeletion(client, userId);
                removeVouch(userId);
            }
        } catch (error) {
            console.error(`Error checking vouch for ${userId}:`, error);
        }
    }
}

async function handleVouchDelete(message, client) {
    if (message.channelId !== VOUCH_CHANNEL_ID) return;
    
    const vouches = loadVouches();
    for (const [userId, data] of Object.entries(vouches)) {
        if (data.messageId === message.id) {
            console.log(`Vouch deleted by user ${userId}, banning...`);
            await banUserForVouchDeletion(client, userId);
            removeVouch(userId);
            break;
        }
    }
}

async function banUserForVouchDeletion(client, userId) {
    try {
        const guild = client.guilds.cache.get(require('../../config').discord.guildId);
        if (!guild) return;

        const member = await guild.members.fetch(userId).catch(() => null);
        if (member) {
            await member.ban({ reason: 'Deleted vouch message' });
            console.log(`User ${userId} banned for deleting vouch`);
        }
    } catch (error) {
        console.error(`Failed to ban user ${userId}:`, error);
    }
}

module.exports = {
    hasVouch,
    addVouch,
    removeVouch,
    getVouchMessageId,
    checkVouchStatus,
    handleVouchDelete,
    scanVouchChannel,
    VOUCH_CHANNEL_ID
};
