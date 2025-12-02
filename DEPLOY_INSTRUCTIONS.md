# 🚀 Deploy Instructions - FiveM Tools V7

## ✅ Cleanup Complete!

Semua duplikasi telah dihapus dan code telah dioptimasi.

**Summary:**
- ✅ 40+ file duplikat dihapus
- ✅ Code optimization 100%
- ✅ Build success
- ✅ Ready for deploy

## 📋 Step 1: Create GitHub Repository

### Option A: Via GitHub Website (Recommended)
1. Go to https://github.com/new
2. Repository name: `fivem-tools-v7`
3. Description: `FiveM Tools V7 - Ultimate Resource Hub`
4. Visibility: Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Option B: Via GitHub CLI
```bash
gh auth login
gh repo create fivem-tools-v7 --public --source=. --push
```

## 📋 Step 2: Push to GitHub

After creating the repository, run these commands:

```bash
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"

# Remove old remote (if exists)
git remote remove origin

# Add new remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/fivem-tools-v7.git

# Push to GitHub
git push -u origin main
```

**If you get authentication error:**
1. GitHub will open browser for authentication
2. Login with your GitHub account
3. Authorize Git Credential Manager
4. Return to terminal, push will continue automatically

## 📋 Step 3: Deploy to Vercel

### Option A: Via Vercel Website (Recommended)
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository: `USERNAME/fivem-tools-v7`
4. Click "Import"
5. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   ```
   VITE_API_KEY=your_base44_api_key
   VITE_APP_ID=your_base44_app_id
   VITE_DISCORD_CLIENT_ID=your_discord_client_id
   VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret
   VITE_DISCORD_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
   VITE_DISCORD_WEBHOOK_URL=your_discord_webhook_url
   ```
7. Click "Deploy"

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 📋 Step 4: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `fivemtools.net`
3. Update DNS records at your domain provider:
   - Type: CNAME
   - Name: @
   - Value: cname.vercel-dns.com
4. Wait for DNS propagation (5-30 minutes)

## 📋 Step 5: Update Discord OAuth

After deployment, update Discord OAuth redirect URI:

1. Go to https://discord.com/developers/applications
2. Select your application
3. OAuth2 → Redirects
4. Add: `https://your-domain.vercel.app/auth/callback`
5. Save changes

## 📋 Step 6: Test Production

1. Visit your deployed site
2. Test login with Discord
3. Test asset browsing
4. Test forum features
5. Test admin panel (if admin)

## 🎯 Quick Deploy Script

Use the included `deploy-all.bat` script:

```bash
deploy-all.bat
```

Select option:
- [1] Push to GitHub
- [2] Deploy to Vercel
- [3] Full Deploy (GitHub + Vercel)

## 📞 Support

If you encounter any issues:

1. Check build logs in Vercel
2. Verify environment variables
3. Check Discord OAuth settings
4. Join Discord: https://discord.gg/WYR27uKFns

## ✅ Checklist

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Add environment variables
- [ ] Configure custom domain (optional)
- [ ] Update Discord OAuth redirect
- [ ] Test production site
- [ ] Celebrate! 🎉

---

**Version:** 7.3.0
**Status:** Ready for Deploy
**Build:** ✅ Success
