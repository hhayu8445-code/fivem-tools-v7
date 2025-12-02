# ⚡ Quick Start Guide - FiveM Tools V7

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_KEY=your_base44_api_key
VITE_APP_ID=your_base44_app_id
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret
VITE_DISCORD_REDIRECT_URI=https://fivemtools.net/auth/callback
VITE_DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
DENGNA/
├── src/
│   ├── api/
│   │   └── base44Client.js          # API client
│   ├── Components/
│   │   ├── ui/                      # Radix UI components
│   │   ├── AnalyticsChart.jsx       # 📊 Charts
│   │   ├── ErrorBoundary.jsx        # 🛡️ Error handling
│   │   └── ...
│   ├── Entities/
│   │   ├── Achievement.js           # 🏆 NEW
│   │   ├── Asset.js
│   │   ├── UserProfile.js
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useRealtime.js           # 🔴 NEW
│   ├── Pages/
│   │   ├── Home.jsx
│   │   ├── Explore.jsx
│   │   ├── Community.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Admin.jsx                # 📊 Enhanced
│   │   └── ...
│   ├── utils/
│   │   ├── gamification.js          # 🏆 NEW
│   │   ├── security.js              # 🔒 NEW
│   │   └── adminConfig.js
│   ├── App.jsx                      # 🛡️ Enhanced
│   ├── Layout.jsx                   # 🔴 Enhanced
│   └── main.jsx
├── .env.example
├── package.json
├── README.md
├── IMPLEMENTATION_COMPLETE.md       # 📝 NEW
├── FEATURES_SUMMARY.md              # 📝 NEW
└── QUICK_START.md                   # 📝 NEW (this file)
```

---

## 🎯 Key Features Usage

### 🏆 Gamification System

**Award Achievement:**
```javascript
import { checkAndAwardAchievement } from '@/utils/gamification';

// Award achievement
const achievement = await checkAndAwardAchievement(userEmail, 'first_download');
if (achievement) {
  toast.success('🎉 Achievement Unlocked!');
}
```

**Get User Achievements:**
```javascript
import { getUserAchievements } from '@/utils/gamification';

const achievements = await getUserAchievements(userEmail);
```

---

### 🔴 Real-time Features

**Track Online Users:**
```javascript
import { useOnlineUsers } from '@/hooks/useRealtime';

function MyComponent() {
  const { data: onlineUsers } = useOnlineUsers();
  return <div>Online: {onlineUsers?.length}</div>;
}
```

**Update User Presence:**
```javascript
import { useUpdatePresence } from '@/hooks/useRealtime';

function MyComponent() {
  const user = useAuth();
  useUpdatePresence(user?.email); // Auto updates every 60s
  return <div>...</div>;
}
```

**Live Notifications:**
```javascript
import { useLiveNotifications } from '@/hooks/useRealtime';

function MyComponent() {
  const { data: notifications } = useLiveNotifications(userEmail);
  return <div>Unread: {notifications?.filter(n => !n.is_read).length}</div>;
}
```

---

### 📊 Analytics Dashboard

**Use Charts:**
```javascript
import { DownloadChart, CategoryChart, StatsCard } from '@/Components/AnalyticsChart';

function AdminDashboard() {
  return (
    <>
      <StatsCard title="Total Users" value={1234} icon="👥" trend={5} />
      <DownloadChart data={downloadData} />
      <CategoryChart data={categoryData} />
    </>
  );
}
```

---

### 🔒 Security Utilities

**Validate Input:**
```javascript
import { validateThreadTitle, validateThreadContent, sanitizeInput } from '@/utils/security';

// Validate
const titleCheck = validateThreadTitle(title);
if (!titleCheck.valid) {
  toast.error(titleCheck.error);
  return;
}

// Sanitize
const clean = sanitizeInput(userInput, 500);
```

**Rate Limiting:**
```javascript
import { rateLimit } from '@/utils/security';

const check = rateLimit('action_key', 5, 300000); // 5 attempts per 5 min
if (!check.allowed) {
  toast.error(`Wait ${Math.ceil(check.retryAfter / 1000)}s`);
  return;
}
```

**XSS Prevention:**
```javascript
import { preventXSS } from '@/utils/security';

const safe = preventXSS(userInput);
```

---

## 🔧 Common Tasks

### Add New Achievement
1. Edit `src/utils/gamification.js`
2. Add to `ACHIEVEMENTS` object
3. Call `checkAndAwardAchievement()` where needed

### Add New Entity
1. Create `src/Entities/MyEntity.js`
2. Define schema (JSON)
3. Use with `base44.entities.MyEntity`

### Add New Page
1. Create `src/Pages/MyPage.jsx`
2. Add route in `src/App.jsx`
3. Add navigation in `src/Layout.jsx`

### Add New Component
1. Create `src/Components/MyComponent.jsx`
2. Import where needed
3. Use with props

---

## 🐛 Debugging

### Check Console
```javascript
console.log('Debug:', data);
```

### Check Network
- Open DevTools → Network tab
- Filter by XHR/Fetch
- Check API responses

### Check Errors
- Errors caught by ErrorBoundary
- Logged to Discord webhook (production)
- Check browser console (development)

---

## 📦 Build & Deploy

### Local Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel
```bash
vercel --prod
```

Or use Vercel dashboard:
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically on push

---

## 🔑 Environment Variables

### Required
- `VITE_API_KEY` - Base44 API key
- `VITE_APP_ID` - Base44 app ID
- `VITE_DISCORD_CLIENT_ID` - Discord OAuth client ID
- `VITE_DISCORD_CLIENT_SECRET` - Discord OAuth secret
- `VITE_DISCORD_REDIRECT_URI` - OAuth callback URL
- `VITE_DISCORD_WEBHOOK_URL` - Discord webhook for logs

### Get Credentials

**Base44:**
1. Go to https://base44.dev
2. Create account
3. Create new app
4. Copy API key & App ID

**Discord OAuth:**
1. Go to https://discord.com/developers/applications
2. Create new application
3. Add redirect URI: `https://fivemtools.net/auth/callback`
4. Copy Client ID & Secret

**Discord Webhook:**
1. Go to Discord server settings
2. Integrations → Webhooks
3. Create webhook
4. Copy webhook URL

---

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#d946ef', // Change this
    }
  }
}
```

### Change Logo
Replace image URL in `src/Layout.jsx`:
```javascript
<img src="YOUR_LOGO_URL" alt="Logo" />
```

### Change Fonts
Edit `src/Layout.jsx` (bottom style tag):
```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap');
body { font-family: 'YourFont', sans-serif; }
```

---

## 📚 Resources

### Documentation
- [README.md](./README.md) - Main documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment guide
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - New features
- [FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md) - All features

### External Docs
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [React Query](https://tanstack.com/query)
- [Base44](https://base44.dev)

---

## 🆘 Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

### API Errors
- Check `.env` variables
- Verify Base44 credentials
- Check network tab in DevTools

### Auth Errors
- Verify Discord OAuth settings
- Check redirect URI matches
- Clear browser cookies

---

## 💡 Tips

1. **Use React DevTools** - Install browser extension
2. **Check Console** - Always check for errors
3. **Test Locally** - Before deploying
4. **Use Git** - Commit often
5. **Read Docs** - Check documentation first

---

## 🎉 You're Ready!

Start building amazing features for the FiveM community!

**Need help?** Join our Discord: https://discord.gg/WYR27uKFns
