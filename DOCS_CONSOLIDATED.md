# 📚 FiveM Tools V7 - Complete Documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Discord Developer Account
- Base44 Account

### Installation
```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## 🔧 Environment Setup

Create `.env` file:
```env
VITE_API_KEY=your_base44_api_key
VITE_APP_ID=your_base44_app_id
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret
VITE_DISCORD_REDIRECT_URI=https://fivemtools.net/auth/callback
VITE_DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

## 🌐 Deployment

### Vercel Deployment
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Custom Domain
1. Add domain in Vercel
2. Update DNS records:
   - Type: CNAME
   - Name: @
   - Value: cname.vercel-dns.com

## 🔐 Discord OAuth Setup

1. Go to https://discord.com/developers/applications
2. Create New Application
3. OAuth2 → Add Redirect URI: `https://fivemtools.net/auth/callback`
4. Enable scopes: `identify`, `email`, `guilds`
5. Copy Client ID & Secret to `.env`

## 📦 Features Overview

### Authentication
- Discord OAuth2 integration
- Auto profile creation
- Session management

### Asset Management
- Browse 1000+ assets
- Filter by category/framework
- Download tracking

### Community Forum
- Multiple categories
- Create/edit threads & replies
- Like system & reputation
- Report system
- Poll creation

### Direct Messages
- Private messaging
- Real-time updates
- Message history

### Membership System
- Free: 3 downloads/day
- VIP: Unlimited downloads
- Admin: Full access

### Gamification
- 7 Achievement types
- Auto award system
- Points system
- Toast notifications

### Real-time Features
- Online users tracking
- Auto presence updates
- Live notifications
- Real-time stats

### Analytics Dashboard
- Download trends
- Category distribution
- Stats cards
- Growth trends

### Security
- XSS prevention
- Input validation
- Rate limiting
- CSRF protection
- Error logging

## 🛠️ Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview build
npm run lint     # Lint code
```

## 📝 Git Workflow

```bash
git add .
git commit -m "Your message"
git push origin main
```

## 🔒 Admin Configuration

Admin IDs are configured in `src/config/admin.js`:
```javascript
export const ADMIN_CONFIG = {
  ADMIN_IDS: ['1197320834889560127'],
  isAdmin: (userId) => ADMIN_CONFIG.ADMIN_IDS.includes(userId)
};
```

## 🐛 Troubleshooting

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm run build -- --force`

### Auth Issues
- Check Discord redirect URI
- Verify environment variables
- Clear browser cache

### Deployment Issues
- Check Vercel logs
- Verify environment variables
- Check DNS propagation

## 📞 Support

- Discord: https://discord.gg/WYR27uKFns
- Website: https://fivemtools.net

---

Made with ❤️ for FiveM Community
