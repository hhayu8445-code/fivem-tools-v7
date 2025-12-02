const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const FiveMDecryptor = require('./decryptor');
const { ensureEmptyDir, downloadTo, extractZipTo, findResourceDirs, dirFileCount, zipDirectory } = require('./utils');
const { getUserCredits, addCredits, removeCredits, hasEnoughCredits, setCredits, getUserSubscription, hasValidSubscription, setSubscription, removeSubscription, canUserDecrypt } = require('./credits');
const { createBackup, cleanOldBackups } = require('./backup');
const { validateApiKey, updateKeyUsage, createApiKey } = require('../api/auth');
const config = require('../../config');

async function handleDecryptCommand(interaction) {
    const file = interaction.options.getAttachment('file');
    const cfxKey = interaction.options.getString('cfx_key');
    const userId = interaction.user.id;

    // Check vouch requirement
    const { hasVouch } = require('./vouch');
    if (!hasVouch(userId)) {
        const vouchEmbed = new EmbedBuilder()
            .setTitle('Vouch Required')
            .setDescription(`You must post a vouch message in <#${config.discord.vouchChannelId}> before using decrypt.\n\n**Example:**\n\`+rep good decrypt service\`\n\`+rep fast and reliable\`\n\n⚠️ **DO NOT DELETE** your vouch or you will be banned!`)
            .setColor(0xff0000)
            .setTimestamp();
        
        await interaction.reply({ embeds: [vouchEmbed], flags: 64 });
        return;
    }

    let confirmationText = `**File:** ${file.name}\n**Cost:** Free\n\nDo you want to proceed with the decryption?`;

    const confirmEmbed = new EmbedBuilder()
        .setTitle('Decrypt Confirmation')
        .setDescription(confirmationText)
        .setColor(0x0099ff)
        .setTimestamp();

    const confirmRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('confirm_decrypt')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
            .setCustomId('cancel_decrypt')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
        );

    let reply;
    try {
        reply = await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmRow],
            flags: 64,
            fetchReply: true
        });
    } catch (error) {
        console.error('Reply error:', error.message);
        return;
    }

    console.log(`Waiting for confirmation from user ${interaction.user.tag} (${interaction.user.id})`);

    const filter = (i) => {
        console.log(`Button interaction from ${i.user.tag} (${i.user.id}), customId: ${i.customId}`);
        return i.user.id === interaction.user.id;
    };

    try {
        console.log('Starting awaitMessageComponent...');


        const confirmation = await reply.awaitMessageComponent({
            filter,
            time: 60000
        });
        console.log(`Confirmation received: ${confirmation.customId}`);

        if (confirmation.customId === 'cancel_decrypt') {
            const cancelEmbed = new EmbedBuilder()
                .setTitle('Decryption Cancelled')
                .setDescription('Decryption has been cancelled. No credits were charged.')
                .setColor(0xff0000)
                .setTimestamp();

            await confirmation.update({
                embeds: [cancelEmbed],
                components: []
            });
            return;
        }

        if (confirmation.customId === 'confirm_decrypt') {
            await confirmation.deferUpdate();
            await startDecryption(confirmation, file, false, cfxKey);
        }
    } catch (error) {
        if (error.code !== 'InteractionCollectorError') {
            console.error('awaitMessageComponent error:', error.message);
            console.error('Error details:', error);
        } else {
            console.log('User confirmation timed out after 60 seconds');
        }

        const timeoutEmbed = new EmbedBuilder()
            .setTitle('Confirmation Timeout')
            .setDescription('Confirmation timed out after 60 seconds. No credits were charged.')
            .setColor(0xff9900)
            .setTimestamp();

        try {
            await interaction.editReply({
                embeds: [timeoutEmbed],
                components: []
            });
        } catch (editError) {
            if (editError.code === 10062) {
                try {
                    await interaction.followUp({ embeds: [timeoutEmbed], ephemeral: true });
                } catch (followupError) {
                    console.log('Error sending timeout followup message:', followupError.message);
                }
            } else {
                console.log('Error updating interaction for timeout:', editError.message);
            }
        }
    }
}

async function startDecryption(interaction, file, usedSubscription = false, cfxKey = null) {

    const sessionDir = path.join(__dirname, '..', '..', 'sessions', interaction.id);
    const uploadsDir = path.join(sessionDir, 'Uploads');
    const resourcesDir = path.join(sessionDir, 'Resources');
    const outputDir = path.join(sessionDir, 'Output');
    const tempDir = path.join(sessionDir, 'TempCompiled');

    try {
        ensureEmptyDir(sessionDir);
        ensureEmptyDir(uploadsDir);
        ensureEmptyDir(resourcesDir);
        ensureEmptyDir(outputDir);
        ensureEmptyDir(tempDir);

        const progressEmbed1 = new EmbedBuilder()
            .setTitle('🔄 Processing')
            .setDescription('📥 Downloading file...')
            .setColor(0x0099ff)
            .setImage('https://i.pinimg.com/originals/5d/c3/cc/5dc3ccae47d20dedb229267b811ff239.gif')
            .setTimestamp();

        await interaction.editReply({ embeds: [progressEmbed1], components: [] });

        const uploadedPath = path.join(uploadsDir, file.name);
        console.log("File url: " + file.url)
        await downloadTo(file.url, uploadedPath);

        const progressEmbed2 = new EmbedBuilder()
            .setTitle('🔄 Processing')
            .setDescription('📂 Extracting files...')
            .setColor(0x0099ff)
            .setImage('https://i.pinimg.com/originals/5d/c3/cc/5dc3ccae47d20dedb229267b811ff239.gif')
            .setTimestamp();

        await interaction.editReply({ embeds: [progressEmbed2], components: [] });

        const ext = path.extname(uploadedPath).toLowerCase();
        if (ext === '.zip') {
            extractZipTo(resourcesDir, uploadedPath);
        } else if (ext === '.fxap') {
            const name = path.basename(uploadedPath, ext);
            const target = path.join(resourcesDir, name);
            fs.mkdirSync(target, { recursive: true });
            fs.copyFileSync(uploadedPath, path.join(target, '.fxap'));
        } else {
            throw new Error('Unsupported file type');
        }

        const progressEmbed3 = new EmbedBuilder()
            .setTitle('🔄 Processing')
            .setDescription('🔐 Processing decryption...')
            .setColor(0x0099ff)
            .setImage('https://i.pinimg.com/originals/5d/c3/cc/5dc3ccae47d20dedb229267b811ff239.gif')
            .setTimestamp();

        await interaction.editReply({ embeds: [progressEmbed3], components: [] });

        const decryptor = new FiveMDecryptor(outputDir, tempDir);
        const resourceDirs = findResourceDirs(resourcesDir);

        for (const dir of resourceDirs) {
            const resourceName = path.basename(dir);
            await decryptor.decryptResource(null, dir, resourceName, cfxKey);
        }

        const filesProduced = dirFileCount(outputDir);
        if (filesProduced === 0) {
            const failDescription = 'No decrypted files were produced. Check CFX key authorization and input structure.';

            const failEmbed = new EmbedBuilder()
                .setTitle('Decryption Failed')
                .setDescription(failDescription)
                .setColor(0xff9900)
                .setTimestamp();

            await interaction.editReply({ embeds: [failEmbed], components: [] });
            return;
        }

        const progressEmbed4 = new EmbedBuilder()
            .setTitle('🔄 Processing')
            .setDescription('🔧 Refactoring Lua files...')
            .setColor(0x0099ff)
            .setImage('https://i.pinimg.com/originals/5d/c3/cc/5dc3ccae47d20dedb229267b811ff239.gif')
            .setTimestamp();

        await interaction.editReply({ embeds: [progressEmbed4], components: [] });

        // Add UDG txt files and refactor Lua
        const LuaRefactor = require('./lua-refactor');
        const refactor = new LuaRefactor();
        
        const addReadmeFiles = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            const readmeContent = `Prompt for Lua (FiveM) script refactoring:
FOLLOW THIS PROMPT 100% ACCORDING TO THE ORIGINAL SCRIPT OWNER WITH THEIR CODING AND SUPPORT:
ESX/QBCORE/QBX_CORE
Objective: Refactor Lua (FiveM) scripts maintaining 100% of the original functionality, but with: ✅ Descriptive names (no var1, var2, etc.) ✅ Organized structure (dedicated functions, simplified logic) ✅ Zero unnecessary comments (only where critical) ✅ Full compatibility (preserve global variables used in other files)
Function pattern:

* Do not use local functions - always use direct functions
* For callbacks/handlers: use anonymous functions directly:
lua

RegisterCommand("antilag", function(source, args, rawCommand)

-- (Code here)

For normal functions: create a function and then assign if necessary: lua
function ToggleAntilag()

-- Code here

Do not change:

* Registered events (RegisterNetEvent, AddEventHandler)
* Global table names (cfg, p_flame_location, etc.)
* Global variables used between files
Improve:

* Replace var1, var2 with names like currentGear, flameActive
* Extract repetitive blocks into dedicated functions
* Use pairs to iterate data when appropriate
Feedback when: ⚠️ Unsure about the purpose of a code block ⚠️ Encountering mysterious global variables (e.g., L1_1 = _ENV[...]) ⚠️ Needing me to explain the logic of some section`;
            
            const udgContent = 'UDG V 6.0 DECRYPT NO KEY https://discord.gg/WYR27uKFns / https://discord.gg/undergrounddevelopments';
            
            fs.writeFileSync(path.join(dir, 'README.txt'), readmeContent);
            fs.writeFileSync(path.join(dir, 'UDG.txt'), udgContent);
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    addReadmeFiles(fullPath);
                }
            }
        };
        
        addReadmeFiles(outputDir);
        refactor.processDirectory(outputDir);

        const progressEmbed5 = new EmbedBuilder()
            .setTitle('🔄 Processing')
            .setDescription('📦 Creating download package...')
            .setColor(0x0099ff)
            .setImage('https://i.pinimg.com/originals/5d/c3/cc/5dc3ccae47d20dedb229267b811ff239.gif')
            .setTimestamp();

        await interaction.editReply({ embeds: [progressEmbed5], components: [] });

        const zipPath = path.join(sessionDir, 'Output.zip');
        await zipDirectory(outputDir, zipPath, 'UNTUK CLEAN SCRIPT DECRYPT INI');

        createBackup(
            interaction.id,
            interaction.user.tag,
            file.name,
            outputDir,
            cfxKey,
            'Discord Bot Interface',
            false
        );

        cleanOldBackups(30);


        const doneEmbed = new EmbedBuilder()
            .setTitle('Decryption Complete')
            .setDescription(`Your files have been successfully decrypted and cleaned!\n\n**Files:** ${filesProduced}\n**Lua files refactored for clean code**\n**README.txt + UDG.txt added to all folders**`)
            .setColor(0x00ff00)
            .setImage('https://cdn.dribbble.com/userupload/22050859/file/original-0bc2fa58763cee104c6c6092a3ae2d91.gif')
            .setTimestamp();

        if (global.discordLogger) {
            await global.discordLogger.logSuccess(
                interaction.user,
                file.name,
                interaction.id,
                filesProduced,
                usedSubscription,
                cfxKey
            );
        }

        const { AttachmentBuilder } = require('discord.js');
        const attachment = new AttachmentBuilder(zipPath, { name: `decrypted_${file.name.replace(/\.[^/.]+$/, '')}.zip` });
        
        await interaction.editReply({ 
            embeds: [doneEmbed], 
            files: [attachment],
            components: [] 
        });
    } catch (error) {
        console.error('Decryption error:', error);
        
        let errorDescription = `Error: ${error.message}`;
        
        if (error.message.includes('Download failed')) {
            errorDescription = 'Failed to download file. Please try again or check if the file is too large.';
        } else if (error.message.includes('timeout')) {
            errorDescription = 'Operation timed out. Please try again with a smaller file.';
        } else if (error.message.includes('ECONNABORTED')) {
            errorDescription = 'Connection aborted. Please check your internet connection and try again.';
        }

        if (global.discordLogger) {
            await global.discordLogger.logError(
                interaction.user,
                file.name,
                error,
                interaction.id,
                false,
                cfxKey
            );
        }

        const errorEmbed = new EmbedBuilder()
            .setTitle('Decryption Failed')
            .setDescription(errorDescription)
            .setColor(0xff0000)
            .setTimestamp();

        try {
            await interaction.editReply({ embeds: [errorEmbed], components: [] });
        } catch (updateError) {
            if (updateError.code === 10062) {
                try {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } catch (followupError) {
                    console.log('Error sending followup message:', followupError.message);
                }
            } else {
                console.log('Error updating interaction:', updateError.message);
            }
        }
        
        // Cleanup session directory
        try {
            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
            }
        } catch (cleanupError) {
            console.log('Cleanup error:', cleanupError.message);
        }
    }
}

async function updateProgress(interaction, message, color) {
    const progressEmbed = new EmbedBuilder()
        .setTitle('🔄 Processing')
        .setDescription(message)
        .setColor(color)
        .setTimestamp();

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [progressEmbed] });
        } else {
            await interaction.update({ embeds: [progressEmbed] });
        }
    } catch (error) {
        if (error.code === 10062) {
            try {
                await interaction.followUp({ embeds: [progressEmbed], ephemeral: true });
            } catch (followupError) {
                console.log('Error sending progress followup message:', followupError.message);
            }
        } else {
            console.log('Progress update failed:', error.message);
        }
    }
}

async function handleCreditsCommand(interaction) {
    const userId = interaction.user.id;
    const credits = getUserCredits(userId);
    const subscription = getUserSubscription(userId);
    const hasValidSub = hasValidSubscription(userId);

    let description = `**Current Balance:** ${credits} credits\n`;

    if (subscription) {
        const subType = subscription.type;
        const expiryText = subscription.type === 'lifetime' ? 'Never' :
            subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A';
        description += `**Subscription:** ${subType} (${subscription.isActive ? 'Active' : 'Inactive'})\n`;
        description += `**Expires:** ${expiryText}\n\n`;

        if (hasValidSub) {
            description += `*You have an active subscription - decryptions are free!*`;
        } else {
            description += `*Your subscription has expired - each decryption costs 1 credit*`;
        }
    } else {
        description += `**Subscription:** None\n\n*Each decryption costs 1 credit*`;
    }

    const creditsEmbed = new EmbedBuilder()
        .setTitle('Your Account Status')
        .setDescription(description)
        .setColor(0x0099ff)
        .setTimestamp();

    await interaction.reply({ embeds: [creditsEmbed], flags: 64 });
}

async function handleAddCreditsCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (addCredits(targetUser.id, amount)) {
        const newBalance = getUserCredits(targetUser.id);


        const successEmbed = new EmbedBuilder()
            .setTitle('Credits Added')
            .setDescription(`**User:** ${targetUser.tag}\n**Added:** ${amount} credits\n**New Balance:** ${newBalance} credits`)
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], flags: 64 });
    } else {
        const errorEmbed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Failed to add credits. Please try again.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
}

async function handleRemoveCreditsCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const currentCredits = getUserCredits(targetUser.id);

    if (amount === 0) {
        if (setCredits(targetUser.id, 0)) {
            const successEmbed = new EmbedBuilder()
                .setTitle('Credits Wiped')
                .setDescription(`**User:** ${targetUser.tag}\n**Previous Balance:** ${currentCredits} credits\n**New Balance:** 0 credits`)
                .setColor(0xff9900)
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed], flags: 64 });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('Failed to wipe credits. Please try again.')
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    } else {
        if (removeCredits(targetUser.id, amount)) {
            const newBalance = getUserCredits(targetUser.id);
            const successEmbed = new EmbedBuilder()
                .setTitle('Credits Removed')
                .setDescription(`**User:** ${targetUser.tag}\n**Removed:** ${amount} credits\n**Previous Balance:** ${currentCredits} credits\n**New Balance:** ${newBalance} credits`)
                .setColor(0xff9900)
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed], flags: 64 });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('Failed to remove credits. User may not have enough credits.')
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    }
}

async function handleApiKeyCreateCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const name = interaction.options.getString('name');
    const customKey = interaction.options.getString('key');
    const subscriptionType = interaction.options.getString('subscription') || 'monthly';
    const monthsValid = interaction.options.getInteger('months') || 1;

    try {
        let apiKey;
        if (customKey) {
            const fs = require('fs');
            const path = require('path');
            const dbPath = path.join(__dirname, '..', 'database', 'api-keys.json');
            const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

            if (db.keys[customKey]) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('API Key Creation Failed')
                    .setDescription('This API key already exists!')
                    .setColor(0xff0000)
                    .setTimestamp();

                await interaction.reply({ embeds: [errorEmbed], flags: 64 });
                return;
            }

            let expiresAt = null;
            if (subscriptionType === 'monthly') {
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + monthsValid);
                expiresAt = expiryDate.toISOString();
            }

            db.keys[customKey] = {
                name,
                subscriptionType,
                expiresAt,
                lastUsed: null,
                isActive: true,
                createdAt: new Date().toISOString()
            };

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            apiKey = customKey;
        } else {
            apiKey = createApiKey(name, subscriptionType, monthsValid);
        }

        const expiryText = subscriptionType === 'lifetime' ? 'Never' :
            subscriptionType === 'monthly' ? `${monthsValid} month(s) from now` : 'N/A';

        const successEmbed = new EmbedBuilder()
            .setTitle('API Key Created')
            .setDescription(`**API Key:** \`${apiKey}\`\n**Name:** ${name}\n**Subscription Type:** ${subscriptionType}\n**Expires:** ${expiryText}`)
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], flags: 64 });
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('API Key Creation Failed')
            .setDescription('An error occurred while creating the API key.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
}

async function handleApiKeyListCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    try {
        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(__dirname, '..', 'database', 'api-keys.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        const keys = Object.keys(db.keys);

        if (keys.length === 0) {
            const noKeysEmbed = new EmbedBuilder()
                .setTitle('API Keys')
                .setDescription('No API keys found.')
                .setColor(0xff9900)
                .setTimestamp();

            await interaction.reply({ embeds: [noKeysEmbed], flags: 64 });
            return;
        }

        let description = '';
        keys.slice(0, 10).forEach(key => {
            const data = db.keys[key];
            const shortKey = key.length > 20 ? key.substring(0, 20) + '...' : key;
            const expiryStatus = data.subscriptionType === 'lifetime' ? 'Never' :
                data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : 'N/A';

            description += `**${shortKey}**\n`;
            description += `Name: ${data.name}\n`;
            description += `Subscription: ${data.subscriptionType || 'legacy'}\n`;
            description += `Expires: ${expiryStatus}\n`;
            description += `Active: ${data.isActive}\n`;
            description += `Last Used: ${data.lastUsed || 'Never'}\n\n`;
        });

        if (keys.length > 10) {
            description += `... and ${keys.length - 10} more keys`;
        }

        const listEmbed = new EmbedBuilder()
            .setTitle(`API Keys (${keys.length} total)`)
            .setDescription(description)
            .setColor(0x0099ff)
            .setTimestamp();

        await interaction.reply({ embeds: [listEmbed], flags: 64 });
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Failed to load API keys.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
}

async function handleApiKeyRemoveCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const apiKey = interaction.options.getString('key');

    try {
        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(__dirname, '..', 'database', 'api-keys.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        if (!db.keys[apiKey]) {
            const notFoundEmbed = new EmbedBuilder()
                .setTitle('API Key Not Found')
                .setDescription('The specified API key does not exist.')
                .setColor(0xff9900)
                .setTimestamp();

            await interaction.reply({ embeds: [notFoundEmbed], flags: 64 });
            return;
        }

        const keyName = db.keys[apiKey].name;
        delete db.keys[apiKey];
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const successEmbed = new EmbedBuilder()
            .setTitle('API Key Removed')
            .setDescription(`**API Key:** \`${apiKey}\`\n**Name:** ${keyName}`)
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], flags: 64 });
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Failed to remove API key.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
}

async function handleApiKeyInfoCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const apiKey = interaction.options.getString('key');
    const keyData = validateApiKey(apiKey);

    if (!keyData) {
        const notFoundEmbed = new EmbedBuilder()
            .setTitle('API Key Not Found')
            .setDescription('The specified API key does not exist.')
            .setColor(0xff9900)
            .setTimestamp();

        await interaction.reply({ embeds: [notFoundEmbed], flags: 64 });
        return;
    }

    const expiryStatus = keyData.subscriptionType === 'lifetime' ? 'Never' :
        keyData.expiresAt ? new Date(keyData.expiresAt).toLocaleString() : 'N/A';

    const infoEmbed = new EmbedBuilder()
        .setTitle('API Key Information')
        .setDescription(`**API Key:** \`${apiKey}\`\n**Name:** ${keyData.name}\n**Subscription Type:** ${keyData.subscriptionType || 'legacy'}\n**Expires:** ${expiryStatus}\n**Request Count:** ${keyData.requestCount}\n**Active:** ${keyData.isActive}\n**Created:** ${keyData.createdAt}\n**Last Used:** ${keyData.lastUsed || 'Never'}`)
        .setColor(0x0099ff)
        .setTimestamp();

    await interaction.reply({ embeds: [infoEmbed], flags: 64 });
}

async function handleSubscriptionAddCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const targetUser = interaction.options.getUser('user');
    const subscriptionType = interaction.options.getString('type');
    const duration = interaction.options.getInteger('duration') || 1;

    try {
        if (setSubscription(targetUser.id, subscriptionType, duration)) {

            const expiryText = subscriptionType === 'lifetime' ? 'Never' :
                subscriptionType === 'monthly' ? `${duration} month(s) from now` :
                subscriptionType === 'weekly' ? `${duration} week(s) from now` : 'N/A';

            const successEmbed = new EmbedBuilder()
                .setTitle('Subscription Added')
                .setDescription(`**User:** ${targetUser.tag}\n**Type:** ${subscriptionType}\n**Duration:** ${duration}\n**Expires:** ${expiryText}`)
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed], flags: 64 });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('Failed to add subscription. Please try again.')
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('Subscription Creation Failed')
            .setDescription('An error occurred while creating the subscription.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
}

async function handleSubscriptionRemoveCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const targetUser = interaction.options.getUser('user');
    const subscription = getUserSubscription(targetUser.id);

    if (!subscription) {
        const noSubEmbed = new EmbedBuilder()
            .setTitle('No Subscription Found')
            .setDescription(`${targetUser.tag} does not have an active subscription.`)
            .setColor(0xff9900)
            .setTimestamp();

        await interaction.reply({ embeds: [noSubEmbed], flags: 64 });
        return;
    }

    if (removeSubscription(targetUser.id)) {

        const successEmbed = new EmbedBuilder()
            .setTitle('Subscription Removed')
            .setDescription(`**User:** ${targetUser.tag}\n**Previous Type:** ${subscription.type}`)
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], flags: 64 });
    } else {
        const errorEmbed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Failed to remove subscription.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
}

async function handleSubscriptionInfoCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const targetUser = interaction.options.getUser('user');
    const credits = getUserCredits(targetUser.id);
    const subscription = getUserSubscription(targetUser.id);
    const hasValidSub = hasValidSubscription(targetUser.id);

    let description = `**User:** ${targetUser.tag}\n**Credits:** ${credits}\n`;

    if (subscription) {
        const expiryText = subscription.type === 'lifetime' ? 'Never' :
            subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A';
        description += `**Subscription Type:** ${subscription.type}\n`;
        description += `**Status:** ${subscription.isActive ? 'Active' : 'Inactive'}\n`;
        description += `**Expires:** ${expiryText}\n`;
        description += `**Created:** ${new Date(subscription.createdAt).toLocaleDateString()}\n`;
        description += `**Valid:** ${hasValidSub ? 'Yes' : 'No'}`;
    } else {
        description += `**Subscription:** None`;
    }

    const infoEmbed = new EmbedBuilder()
        .setTitle('User Account Information')
        .setDescription(description)
        .setColor(0x0099ff)
        .setTimestamp();

    await interaction.reply({ embeds: [infoEmbed], flags: 64 });
}

async function handleBlacklistResourceCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const file = interaction.options.getAttachment('file');

    if (file.name.toLowerCase() !== 'fxap') {
        const errorEmbed = new EmbedBuilder()
            .setTitle('Invalid File Type')
            .setDescription(`Please upload a .fxap file. Received: "${file.name}"`)
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        return;
    }

    try {
        const progressEmbed = new EmbedBuilder()
            .setTitle('🔄 Processing')
            .setDescription('📥 Downloading and analyzing .fxap file...')
            .setColor(0x0099ff)
            .setTimestamp();

        await interaction.reply({ embeds: [progressEmbed], flags: 64 });

        const sessionDir = path.join(__dirname, '..', '..', 'sessions', interaction.id);
        const tempFile = path.join(sessionDir, file.name);

        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        await downloadTo(file.url, tempFile);

        const FiveMDecryptor = require('./decryptor');
        const decryptor = new FiveMDecryptor(null, null);

        if (!decryptor.verifyEncrypted(tempFile)) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Invalid .fxap File')
                .setDescription('The uploaded file is not a valid encrypted .fxap file.')
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });

            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }

            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
            }
            return;
        }

        const fxapBuffer = decryptor.decryptFile(tempFile, config.crypto.defaultKey);
        if (!fxapBuffer) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Decryption Failed')
                .setDescription('Failed to decrypt the .fxap file.')
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });

            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }

            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
            }
            return;
        }

        const resourceId = decryptor.scanForId(fxapBuffer);
        if (!resourceId) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Resource ID Not Found')
                .setDescription('Could not extract resource ID from the .fxap file.')
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });

            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }

            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
            }
            return;
        }

        const blacklistPath = path.join(__dirname, '..', 'database', 'blacklist.json');
        let blacklist = [];

        if (fs.existsSync(blacklistPath)) {
            blacklist = JSON.parse(fs.readFileSync(blacklistPath, 'utf8'));
        }

        const isAlreadyBlacklisted = blacklist.includes(String(resourceId));

        if (isAlreadyBlacklisted) {
            const alreadyBlacklistedEmbed = new EmbedBuilder()
                .setTitle('Already Blacklisted')
                .setDescription(`This resource is already in the blacklist.\n**Resource ID:** ${resourceId}`)
                .setColor(0xff9900)
                .setTimestamp();

            await interaction.editReply({ embeds: [alreadyBlacklistedEmbed] });

            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }

            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
            }
            return;
        }

        blacklist.push(String(resourceId));

        fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2));

        const successEmbed = new EmbedBuilder()
            .setTitle('Resource Blacklisted')
            .setDescription(`**Resource ID:** ${resourceId}\n**File:** ${file.name}`)
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });

        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }

        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }

    } catch (error) {
        console.error('Blacklist command error:', error);

        const errorEmbed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription(`An error occurred while processing the file: ${error.message}`)
            .setColor(0xff0000)
            .setTimestamp();

        try {
            await interaction.editReply({ embeds: [errorEmbed] });
        } catch (editError) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        }

        const tempFile = path.join(__dirname, '..', '..', 'sessions', interaction.id, file.name);
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }

        const sessionDir = path.join(__dirname, '..', '..', 'sessions', interaction.id);
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }
    }
}

async function handleVouchAddCommand(interaction) {
    if (!config.adminUsers.includes(interaction.user.id)) {
        const noPermEmbed = new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xff0000)
            .setTimestamp();
        
        await interaction.reply({ embeds: [noPermEmbed], flags: 64 });
        return;
    }

    const targetUser = interaction.options.getUser('user');
    const { addVouch, hasVouch } = require('./vouch');

    if (hasVouch(targetUser.id)) {
        const alreadyVouchedEmbed = new EmbedBuilder()
            .setTitle('Already Vouched')
            .setDescription(`${targetUser.tag} already has a vouch.`)
            .setColor(0xff9900)
            .setTimestamp();
        
        await interaction.reply({ embeds: [alreadyVouchedEmbed], flags: 64 });
        return;
    }

    addVouch(targetUser.id, 'manual-' + Date.now());
    
    const successEmbed = new EmbedBuilder()
        .setTitle('Vouch Added')
        .setDescription(`✅ Vouch manually added for ${targetUser.tag}\n\nThey can now use /decrypt command.`)
        .setColor(0x00ff00)
        .setTimestamp();
    
    await interaction.reply({ embeds: [successEmbed], flags: 64 });
}

async function handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
        case 'vouch-add':
            await handleVouchAddCommand(interaction);
            break;
        case 'decrypt':
            await handleDecryptCommand(interaction);
            break;
        case 'credits':
            await handleCreditsCommand(interaction);
            break;
        case 'addcredits':
            await handleAddCreditsCommand(interaction);
            break;
        case 'removecredits':
            await handleRemoveCreditsCommand(interaction);
            break;
        case 'subscription-add':
            await handleSubscriptionAddCommand(interaction);
            break;
        case 'subscription-remove':
            await handleSubscriptionRemoveCommand(interaction);
            break;
        case 'subscription-info':
            await handleSubscriptionInfoCommand(interaction);
            break;
        case 'apikey-create':
            await handleApiKeyCreateCommand(interaction);
            break;
        case 'apikey-list':
            await handleApiKeyListCommand(interaction);
            break;
        case 'apikey-remove':
            await handleApiKeyRemoveCommand(interaction);
            break;
        case 'apikey-info':
            await handleApiKeyInfoCommand(interaction);
            break;
        case 'blacklist-resource':
            await handleBlacklistResourceCommand(interaction);
            break;
    }
}

module.exports = {
    handleInteraction
};