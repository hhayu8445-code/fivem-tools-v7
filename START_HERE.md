# 🚀 START HERE - Deploy in 5 Minutes

## ⚡ Quick Deploy

### 1️⃣ Setup Discord OAuth (2 minutes)
```
Go to: https://discord.com/developers/applications/1442938080473645107

1. Click "OAuth2" in sidebar
2. Scroll to "Redirects"
3. Add: https://fivemtools.net/auth/callback
4. Click "Save Changes"
```

### 2️⃣ Run Deploy Script (1 minute)
```bash
# Double click this file:
deploy.bat

# Or run manually:
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"
git init
git add .
git commit -m "Deploy FiveM Tools V7"
```

### 3️⃣ Push to GitHub (1 minute)
```bash
# Create repo at: https://github.com/new
# Name: fivemtools-v7

# Then push:
git remote add origin https://github.com/YOUR_USERNAME/fivemtools-v7.git
git push -u origin main
```

### 4️⃣ Deploy to Vercel (1 minute)
```
Go to: https://vercel.com/new

1. Import your GitHub repo
2. Framework: Vite
3. Add Environment Variables (copy from .env.production)
4. Click "Deploy"
```

### 5️⃣ Setup DNS di cPanel (2 minutes)
```
Di cPanel Anda:
1. Login ke cPanel
2. Domains → Zone Editor
3. Add A Record:
   - Name: @
   - Value: 76.76.21.21
4. Add CNAME Record:
   - Name: www
   - Value: cname.vercel-dns.com
5. Save

See detailed guide: CPANEL_DNS_SETUP.md
```

### 6️⃣ Add Domain in Vercel (30 seconds)
```
In Vercel:
1. Settings → Domains
2. Add: fivemtools.net
3. Wait for DNS verification (5-30 min)
```

---

## ✅ That's It!

Your site will be live at: **https://fivemtools.net**

---

## 📚 Need Help?

- **Full Guide:** See [DEPLOY_NOW.md](./DEPLOY_NOW.md)
- **Checklist:** See [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
- **Discord:** https://discord.gg/WYR27uKFns

---

## 🎯 Your Credentials

```
Discord Client ID: 1442938080473645107
Discord Secret: QTx5ec8Zo2mhRjAfs1Wbuca6a30XeyrB
Domain: fivemtools.net
```

**All set in .env file already!**

---

**Ready? Run `deploy.bat` now! 🚀**
