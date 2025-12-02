# 🔥 FiveCFX Decrypt Bot

**A powerful FiveM resource decryption bot for Discord with a web interface.**

[![Website](https://img.shields.io/badge/Website-fivecfx.com-f40552?style=for-the-badge)](https://fivecfx.com)
[![Discord](https://img.shields.io/badge/Discord-Join%20Us-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.fivecfx.com)

---

## 📋 Features

- ✅ **Discord Bot Integration** - Decrypt files directly from Discord
- 🌐 **Web Interface** - Download decrypted files via web browser
- 🔐 **Credit System** - Manage user credits and subscriptions
- 📦 **Auto-Backup** - Automatic backup of all decryptions
- 🔑 **API Support** - RESTful API for external integrations
- 🛡️ **Blacklist System** - Block specific resources from decryption
- 📊 **Logging** - Discord channel logging for all operations
- 🎨 **Modern UI** - Beautiful dark mode interface

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **Java Runtime** (for Lua decompilation) ([Download](https://java.com))
- **Discord Bot** ([Create one](https://discord.com/developers/applications))

### Installation

1. **Clone or download this repository**
   ```bash
   cd FiveCFX-DecryptBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot** (see Configuration section below)

4. **Start the bot**
   ```bash
   npm start
   ```

---

## ⚙️ Configuration

### 1. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the **Bot** section and create a bot
4. Copy the **Bot Token**
5. Enable these **Privileged Gateway Intents**:
   - Server Members Intent
   - Message Content Intent
6. Go to **OAuth2 > URL Generator**
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Administrator` (or customize as needed)
7. Copy the generated URL and invite the bot to your server

### 2. Get Your IDs

- **Guild ID (Server ID)**: Right-click your server → Copy Server ID
- **Client ID**: Found in Discord Developer Portal → General Information → Application ID
- **Log Channel ID**: Right-click a channel → Copy Channel ID (for logging)
- **User ID (Admin)**: Right-click your profile → Copy User ID

### 3. Edit `config.js`

Open `config.js` and fill in your information:

```javascript
const config = {
    appurl: 'http://localhost:3000/',  // Change to your domain when deploying

    discord: {
        invite: 'YOUR_DISCORD_INVITE_LINK',      // Discord server invite
        token: 'YOUR_DISCORD_BOT_TOKEN',         // Bot token from step 1.4
        clientId: 'YOUR_CLIENT_ID',              // Application ID
        guildId: 'YOUR_GUILD_ID',                // Server ID
        logChannelId: 'YOUR_LOG_CHANNEL_ID'      // Channel ID for logs
    },

    adminUsers: [
        "YOUR_USER_ID"  // Add your Discord user ID here
    ]
};
```

### 4. Port Configuration (Optional)

If deploying to a server, you may need to:

**Windows Firewall:**
```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "FiveCFX Web Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Linux (ufw):**
```bash
sudo ufw allow 3000
```

**Change `appurl` in config.js** to your public IP or domain:
```javascript
appurl: 'http://YOUR_IP_OR_DOMAIN:3000/',
```

---

## 🎮 Usage

### Discord Commands

| Command | Description | Admin Only |
|---------|-------------|-----------|
| `/decrypt <file> [cfx_key]` | Decrypt a FiveM resource | No |
| `/credits` | Check your credit balance | No |
| `/addcredits <user> <amount>` | Add credits to a user | Yes |
| `/removecredits <user> <amount>` | Remove credits from a user | Yes |
| `/subscription-add <user> <type> [duration]` | Add subscription to user | Yes |
| `/subscription-remove <user>` | Remove user subscription | Yes |
| `/subscription-info <user>` | View user subscription info | Yes |
| `/apikey-create <name> [key] [subscription] [months]` | Create API key | Yes |
| `/apikey-list` | List all API keys | Yes |
| `/apikey-remove <key>` | Remove an API key | Yes |
| `/apikey-info <key>` | View API key details | Yes |
| `/blacklist-resource <file>` | Blacklist a resource | Yes |

### Web Interface

1. **User receives decryption link** from Discord bot
2. **Visit**: `http://localhost:3000/` (or your configured URL)
3. **Enter Session ID** provided by the bot
4. **Click "Check Session"** to verify status
5. **Download** when ready

---

## 📁 Project Structure

```
FiveCFX-DecryptBot/
├── config.js              # Main configuration file
├── index.js               # Application entry point
├── package.json           # Dependencies
│
├── src/
│   ├── server.js          # Web server (Express)
│   │
│   ├── api/
│   │   ├── api-server.js  # API server
│   │   ├── auth.js        # API key authentication
│   │   └── decrypt-api.js # Decryption API endpoints
│   │
│   ├── modules/
│   │   ├── backup.js      # Backup management
│   │   ├── commands.js    # Discord command registration
│   │   ├── credits.js     # Credit & subscription system
│   │   ├── decryptor.js   # Core decryption logic
│   │   ├── discord-logger.js  # Discord logging
│   │   ├── handlers.js    # Command handlers
│   │   └── utils.js       # Utility functions
│   │
│   └── database/
│       ├── data.json      # User credits & subscriptions
│       ├── api-keys.json  # API keys database
│       └── blacklist.json # Blacklisted resource IDs
│
├── public/                # Web interface files
│   ├── index.html         # Main page
│   ├── script_23.js       # Frontend JavaScript
│   └── style_23.css       # Styling
│
├── Tools/
│   └── unluac54.jar       # Lua decompiler
│
├── sessions/              # Temporary session files (auto-created)
└── backup/                # Backup storage (auto-created)
```

---

## 🔧 Advanced Configuration

### Credit System

Users need credits or an active subscription to decrypt files:

- **Free decryption**: Users with active subscription (lifetime, monthly, weekly)
- **Paid decryption**: 1 credit per decryption for non-subscribers
- **Admins can manage**: Credits and subscriptions via Discord commands

### Subscription Types

- `lifetime` - Never expires
- `monthly` - Expires after specified months
- `weekly` - Expires after specified weeks

### API Usage

The bot includes a REST API for external integrations:

**Endpoint**: `http://localhost:3001/api/decrypt`

**Method**: POST (multipart/form-data)

**Headers**:
- `X-API-Key`: Your API key

**Body**:
- `file`: The .fxap or .zip file
- `cfxKey`: (optional) CFX license key

### Proxy Support

For Keymaster validation, you can configure a proxy in `config.js`:

```javascript
proxy: {
    enabled: true,
    host: 'proxy.example.com',
    port: 12345,
    auth: {
        username: 'your_username',
        password: 'your_password'
    }
}
```

---

## 🛠️ Troubleshooting

### Bot doesn't start

**Check Node.js version:**
```bash
node --version  # Should be 18+
```

**Reinstall dependencies:**
```bash
rm -rf node_modules
npm install
```

### Discord bot offline

- ✅ Check your bot token in `config.js`
- ✅ Verify the bot has proper permissions
- ✅ Check if the bot is invited to your server

### Web server not accessible

**Windows:**
```powershell
# Check if port is in use
netstat -ano | findstr :3000

# Kill process if needed (replace PID)
taskkill /PID <PID> /F
```

**Linux:**
```bash
# Check if port is in use
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

### Java not found error

Download and install Java Runtime Environment from [java.com](https://java.com)

### Decryption fails

- ✅ Ensure the file is a valid encrypted FiveM resource
- ✅ Check if the resource is blacklisted
- ✅ Verify CFX key if required
- ✅ Check logs for specific error messages

---

## 📝 Changelog

### Version 1.0.0
- Initial release
- Discord bot integration
- Web interface
- Credit & subscription system
- API support
- Auto-backup system
- Blacklist management

---

## 🤝 Support

Need help? Join our community!

- 🌐 **Website**: [fivecfx.com](https://fivecfx.com)
- 💬 **Discord**: [discord.fivecfx.com](https://discord.fivecfx.com)

---

## ⚠️ Disclaimer

This tool is intended for **educational purposes** and **authorized resource decryption only**. 

- ✅ Only decrypt resources you have permission to access
- ❌ Do not use for piracy or unauthorized decryption
- ⚖️ Respect intellectual property rights

---

<div align="center">

**LEAKED by FiveCFX**

[Website](https://fivecfx.com) • [Discord](https://discord.fivecfx.com)

</div>
