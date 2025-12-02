# 🚀 Deploy ke Vercel - Step by Step

## ✅ Prerequisites Sudah Siap
- ✅ Discord Client ID: `1442938080473645107`
- ✅ Discord Client Secret: `QTx5ec8Zo2mhRjAfs1Wbuca6a30XeyrB`
- ✅ Domain: `fivemtools.net`
- ✅ Base44 API Key: Configured
- ✅ Discord Webhook: Configured

---

## 📋 Step 1: Setup Discord Application

1. **Buka Discord Developer Portal:**
   - Go to: https://discord.com/developers/applications/1442938080473645107

2. **Configure OAuth2:**
   - Klik "OAuth2" di sidebar
   - Scroll ke "Redirects"
   - Tambahkan redirect URI:
     ```
     https://fivemtools.net/auth/callback
     ```
   - Klik "Save Changes"

3. **Verify Scopes:**
   - Pastikan scopes berikut enabled:
     - `identify`
     - `email`
     - `guilds`

---

## 📋 Step 2: Initialize Git Repository

```bash
# Navigate to project
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - FiveM Tools V7 with all features"
```

---

## 📋 Step 3: Push to GitHub

### Option A: Create New Repository via GitHub CLI
```bash
# Install GitHub CLI if not installed
# Download from: https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository
gh repo create fivemtools-v7 --public --source=. --remote=origin --push
```

### Option B: Create Repository Manually
1. Go to: https://github.com/new
2. Repository name: `fivemtools-v7`
3. Description: `FiveM Tools V7 - Ultimate Resource Hub`
4. Public repository
5. Don't initialize with README (we already have one)
6. Click "Create repository"

Then push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/fivemtools-v7.git
git branch -M main
git push -u origin main
```

---

## 📋 Step 4: Deploy to Vercel

### Option A: Via Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? fivemtools-v7
# - Directory? ./
# - Override settings? No
```

### Option B: Via Vercel Dashboard
1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository: `fivemtools-v7`
4. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   VITE_API_KEY=0331b989b68d4f18b88add514f4e6803
   VITE_APP_ID=692c9d27fcb03e0d2d610054
   VITE_DISCORD_CLIENT_ID=1442938080473645107
   VITE_DISCORD_CLIENT_SECRET=QTx5ec8Zo2mhRjAfs1Wbuca6a30XeyrB
   VITE_DISCORD_REDIRECT_URI=https://fivemtools.net/auth/callback
   VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1445328264615952496/2amowz5IfdHXgn6tq-nt-D8sQj30GQiIWaV2yVQgvP-Pl4TbR3WZEKvMX39E1w6_sIzu
   ```

6. Click "Deploy"

---

## 📋 Step 5: Configure Custom Domain

### In Vercel Dashboard:
1. Go to your project: https://vercel.com/dashboard
2. Click on your project: `fivemtools-v7`
3. Go to "Settings" → "Domains"
4. Click "Add Domain"
5. Enter: `fivemtools.net`
6. Click "Add"

### Configure DNS (at your domain registrar):
Vercel will show you DNS records to add. Typically:

**Option A: Using Nameservers (Recommended)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B: Using A Record**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Add CNAME for www:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 📋 Step 6: Verify Deployment

1. **Wait for DNS propagation** (5-30 minutes)

2. **Test URLs:**
   - https://fivemtools.net
   - https://www.fivemtools.net
   - https://fivemtools.net/auth/callback

3. **Test Discord Login:**
   - Click "Login with Discord"
   - Should redirect to Discord
   - After auth, should redirect back to site

4. **Check Console:**
   - Open DevTools (F12)
   - Check for errors
   - Verify API calls working

---

## 🔧 Troubleshooting

### Issue: Discord OAuth Error
**Solution:**
- Verify redirect URI in Discord app matches exactly: `https://fivemtools.net/auth/callback`
- Check Client ID and Secret are correct
- Clear browser cache and try again

### Issue: Environment Variables Not Working
**Solution:**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Verify all variables are set
- Redeploy: `vercel --prod` or trigger redeploy in dashboard

### Issue: 404 on Routes
**Solution:**
- Verify `vercel.json` exists with rewrites configuration
- Redeploy

### Issue: Domain Not Working
**Solution:**
- Check DNS propagation: https://dnschecker.org
- Wait up to 48 hours for full propagation
- Verify DNS records are correct

---

## ✅ Post-Deployment Checklist

- [ ] Site loads at https://fivemtools.net
- [ ] Discord login works
- [ ] All pages accessible
- [ ] Assets load correctly
- [ ] Forum works
- [ ] Dashboard accessible
- [ ] Admin panel works (for admin users)
- [ ] Real-time features working
- [ ] Notifications working
- [ ] No console errors

---

## 🎉 Success!

Your site is now live at: **https://fivemtools.net**

### Next Steps:
1. Test all features thoroughly
2. Invite users to test
3. Monitor error logs in Discord webhook
4. Check Vercel analytics
5. Gather feedback from community

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables
4. Check Discord webhook for error logs
5. Join Discord: https://discord.gg/WYR27uKFns

---

**Made with ❤️ for FiveM Community**
