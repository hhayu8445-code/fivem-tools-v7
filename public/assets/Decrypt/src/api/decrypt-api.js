const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FiveMDecryptor = require('../modules/decryptor');
const { ensureEmptyDir, downloadTo, extractZipTo, findResourceDirs, dirFileCount, zipDirectory } = require('../modules/utils');
const { createBackup } = require('../modules/backup');
const config = require('../../config');

class DecryptAPI {
    constructor() {
        this.activeSessions = new Map();
    }

    async startDecryption(file, cfxKey, apiKey, userIP = null) {
        if (!file || !file.originalname) {
            throw new Error('Invalid file provided');
        }

        const sessionId = uuidv4();

        const sessionData = {
            sessionId,
            status: 'processing',
            apiKey,
            startTime: Date.now(),
            file: file.originalname,
            userIP,
            cfxKey
        };

        this.activeSessions.set(sessionId, sessionData);

        this.processDecryption(sessionId, file, cfxKey, apiKey, userIP)
            .then(async(result) => {
                if (!result || !result.zipPath) {
                    throw new Error('Decryption completed but no output file');
                }
                this.activeSessions.set(sessionId, {
                    ...this.activeSessions.get(sessionId),
                    status: 'completed',
                    zipPath: result.zipPath,
                    completedAt: Date.now()
                });

                if (global.discordLogger) {
                    const fields = [
                        { name: 'API Key', value: apiKey, inline: false },
                        { name: 'License Key', value: cfxKey, inline: false },
                        { name: 'File', value: file.originalname, inline: true },
                        { name: 'Session ID', value: sessionId, inline: true },
                        { name: 'IP', value: userIP || 'Unknown', inline: true },
                        { name: 'Time', value: new Date().toLocaleString(), inline: true }
                    ];
                    await global.discordLogger.sendLog('API Decryption Success', '', 0x00ff00, fields);
                }

                setTimeout(() => {
                    this.cleanupSession(sessionId);
                }, 10 * 60 * 1000);
            })
            .catch(async(error) => {
                console.error(`Session ${sessionId} failed:`, error);
                this.activeSessions.set(sessionId, {
                    ...this.activeSessions.get(sessionId),
                    status: 'failed',
                    error: error.message,
                    failedAt: Date.now()
                });

                if (global.discordLogger) {
                    const fields = [
                        { name: 'API Key', value: apiKey, inline: false },
                        { name: 'License Key', value: cfxKey, inline: false },
                        { name: 'File', value: file.originalname, inline: true },
                        { name: 'Session ID', value: sessionId, inline: true },
                        { name: 'IP', value: userIP || 'Unknown', inline: true },
                        { name: 'Time', value: new Date().toLocaleString(), inline: true },
                        { name: 'Error', value: error.message || error.toString(), inline: false }
                    ];
                    await global.discordLogger.sendLog('API Decryption Failed', '', 0xff0000, fields);
                }
            });

        return {
            sessionId,
            status: 'processing'
        };
    }

    async processDecryption(sessionId, file, cfxKey, apiKey, userIP) {
        const sessionDir = path.join(__dirname, '..', '..', 'sessions', sessionId);
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

            const uploadedPath = path.join(uploadsDir, file.originalname);
            if (file.buffer) {
                fs.writeFileSync(uploadedPath, file.buffer);
            } else if (file.url) {
                await downloadTo(file.url, uploadedPath);
            } else {
                throw new Error('No file data provided');
            }

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

            const resourceDirs = findResourceDirs(resourcesDir);
            if (resourceDirs.length === 0) {
                throw new Error('No resources found in the uploaded file');
            }

            const decryptor = new FiveMDecryptor(outputDir, tempDir);

            for (const resourceDir of resourceDirs) {
                const resourceName = path.basename(resourceDir);
                await decryptor.decryptResource(null, resourceDir, resourceName, cfxKey);
            }

            // Add README.txt and UDG.txt files
            const LuaRefactor = require('../modules/lua-refactor');
            const refactor = new LuaRefactor();
            
            const addReadmeFiles = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                
                const readmeContent = `Prompt for Lua (FiveM) script refactoring:
FOLLOW THIS PROMPT 100% ACCORDING TO THE ORIGINAL SCRIPT OWNER WITH THEIR CODING AND SUPPORT:
ESX/QBCORE/QBX_CORE
Objective: Refactor Lua (FiveM) scripts maintaining 100% of the original functionality, but with: ✅ Descriptive names (no L0_1, A0_2, etc.) ✅ Organized structure (dedicated functions, simplified logic) ✅ Zero unnecessary comments (only where critical) ✅ Full compatibility (preserve global variables used in other files)
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

* Replace L0_1, A0_2 with names like currentGear, flameActive
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

            const zipPath = path.join(sessionDir, 'Output.zip');
            await zipDirectory(outputDir, zipPath, 'UNTUK CLEAN SCRIPT DECRYPT INI');

            await createBackup(sessionId, `API_${apiKey.substring(0, 8)}`, file.originalname, outputDir, cfxKey, userIP, true);

            return { zipPath };
        } catch (error) {
            console.error(`Decryption failed for session ${sessionId}:`, error);
            throw error;
        }
    }

    getSessionStatus(sessionId) {
        return this.activeSessions.get(sessionId) || null;
    }

    cleanupSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            this.activeSessions.delete(sessionId);

            const sessionDir = path.join(__dirname, '..', '..', 'sessions', sessionId);
            
            try {
                if (fs.existsSync(sessionDir)) {
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                }
            } catch (error) {
                console.error(`Failed to cleanup session directory ${sessionId}:`, error);
            }
        }
    }

    async shutdown() {
        for (const sessionId of this.activeSessions.keys()) {
            this.cleanupSession(sessionId);
        }
        this.activeSessions.clear();
    }
}

module.exports = DecryptAPI;