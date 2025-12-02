# 🎮 FiveM Tools V7 - Ultimate Resource Hub

Premium platform untuk FiveM scripts, vehicles, MLOs, dan community forum.

## 🌐 Live Demo
**https://fivemtools.net**

## ✨ Features

### 🔐 Authentication
- Discord OAuth2 integration
- Auto profile creation saat login pertama
- Data Discord lengkap (email, username, avatar, guilds)
- Session management & auto logout

### 📦 Asset Management
- Browse 1000+ assets (Scripts, MLOs, Vehicles, Clothing)
- Filter by category, framework (ESX/QBCore), type
- Premium & Free assets
- Download tracking & analytics
- Advanced search functionality

### 💬 Community Forum
- Multiple categories (Announcements, General, Help, Scripts, Jobs)
- Create threads & replies
- Like system & reputation
- Report system untuk moderasi
- Poll creation with voting
- Rich text editor (Quill)

### 💌 Direct Messages
- Private messaging antar users
- Real-time message updates (polling)
- Message history
- Notification on new messages

### 🎖️ Membership System
- Free tier: 3 downloads/day
- VIP tier: Unlimited downloads
- Admin tier: Full access + moderation
- Member badges & visual indicators

### 🏆 Gamification **[NEW]**
- **7 Achievement types** (First Download, First Post, Helpful Member, VIP Member, Veteran, Bug Hunter, Top Contributor)
- **Auto award system** - Achievements unlocked automatically
- **Points system** - Earn points for achievements
- **Toast notifications** - Get notified when unlocking achievements
- **Dashboard display** - View all earned achievements
- Reputation points
- Community badges
- Activity tracking

### 🔴 Real-time Features **[NEW]**
- **Online users tracking** - See who's online (updates every 15s)
- **Auto presence updates** - Your status updates automatically (every 60s)
- **Live notifications** - Get notified in real-time (every 20s)
- **Real-time stats** - Online count, members, assets, downloads
- **Toast notifications** - Instant alerts for new notifications

### 🔔 Notifications
- Real-time notifications with polling
- Forum mentions & replies
- System announcements
- Notification center with mark as read
- Toast notifications for instant alerts

### 📊 Analytics Dashboard **[NEW]**
- **Download trends** - Line chart showing downloads over last 7 days
- **Category distribution** - Bar chart of popular categories
- **Stats cards** - Total assets, downloads, users, VIP members
- **Growth trends** - Percentage changes from last week
- **Real-time updates** - Data refreshes every 30s
- **Recharts integration** - Beautiful, responsive charts

### 🛡️ Admin & Moderation
- Asset management (CRUD)
- User management
- Forum moderation
- Report handling
- **Enhanced analytics dashboard** with charts
- Activity logs to Discord webhook

### 🔒 Security **[NEW]**
- **XSS prevention** - Sanitize all user inputs
- **Input validation** - Validate emails, URLs, content
- **Rate limiting** - Client-side rate limiting (5 actions/5min)
- **CSRF protection** - Token generation & validation
- **File upload validation** - Type & size checks
- **Error logging** - Production errors logged to Discord
- **Comprehensive error boundaries** - Catch all React errors

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite
- **UI:** TailwindCSS + Radix UI
- **State:** TanStack Query
- **Auth:** Discord OAuth2
- **Backend:** Base44 API
- **Deployment:** Vercel
- **Domain:** fivemtools.net

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd DENGNA

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan credentials Anda

# Run development server
npm run dev
```

## 🔧 Environment Variables

```env
VITE_API_KEY=your_base44_api_key
VITE_APP_ID=your_base44_app_id
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret
VITE_DISCORD_REDIRECT_URI=https://fivemtools.net/auth/callback
VITE_DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Panduan deploy ke Vercel
- [Setup Discord Auth](./SETUP_DISCORD_AUTH.md) - Setup Discord OAuth
- [Upvotes Server](./UPVOTES_SERVER_README.md) - FiveM server upvote system
- **[Implementation Complete](./IMPLEMENTATION_COMPLETE.md)** - 5 new features documentation
- **[Features Summary](./FEATURES_SUMMARY.md)** - Complete features overview
- **[Quick Start Guide](./QUICK_START.md)** - 5-minute setup guide

## 🔐 Discord OAuth Setup

1. Buat aplikasi di https://discord.com/developers/applications
2. Tambahkan redirect URI: `https://fivemtools.net/auth/callback`
3. Enable scopes: `identify`, `email`, `guilds`
4. Copy Client ID & Secret ke .env

## 🎯 Auto Profile Creation

Saat user login pertama kali via Discord, sistem otomatis:
1. ✅ Fetch data Discord lengkap (ID, email, username, avatar)
2. ✅ Create UserProfile di database
3. ✅ Set membership tier = "free"
4. ✅ Initialize stats (downloads, posts, reputation, points)
5. ✅ Log activity ke Discord webhook

## 📊 Database Entities

- **Asset** - Scripts, MLOs, Vehicles, Clothing
- **UserProfile** - User data & stats
- **ForumCategory** - Forum categories
- **ForumThread** - Forum threads
- **ForumReply** - Thread replies
- **ForumLike** - Like system
- **ForumReport** - Report system
- **DirectMessage** - Private messages
- **Notification** - User notifications
- **DownloadLog** - Download tracking
- **Achievement** **[NEW]** - User achievements & badges

## 🛠️ Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚀 Deployment

Deploy ke Vercel dengan 1 klik:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

Atau manual:
```bash
npm run build
vercel --prod
```

Lihat [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) untuk detail lengkap.

## 🔒 Security

- ✅ Environment variables untuk semua credentials
- ✅ Discord OAuth2 untuk authentication
- ✅ API key protection
- ✅ **XSS prevention** - Input sanitization
- ✅ **CSRF protection** - Token validation
- ✅ **Rate limiting** - Client-side protection
- ✅ **Input validation** - Email, URL, content checks
- ✅ **Error boundaries** - Comprehensive error handling
- ✅ **Error logging** - Production errors to Discord
- ✅ Secure headers (Vercel)

## 📝 License

Private - All Rights Reserved

## 👥 Support

- Discord: https://discord.gg/WYR27uKFns
- Website: https://fivemtools.net

---

Made with ❤️ for FiveM Community
