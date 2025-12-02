# 🚀 GitHub Setup - Step by Step

## ✅ Status: Git Commit Berhasil!
```
✅ 135 files committed
✅ 27,351 lines of code
✅ Ready to push to GitHub
```

---

## 📋 Option 1: Create New Repository (Recommended)

### Step 1: Create Repository di GitHub
1. Go to: **https://github.com/new**
2. Fill in:
   ```
   Repository name: fivem-tools-v7
   Description: FiveM Tools V7 - Ultimate Resource Hub
   Visibility: Public (or Private)
   ```
3. **DON'T** initialize with README, .gitignore, or license
4. Click **"Create repository"**

### Step 2: Push Code
Setelah repo dibuat, GitHub akan show commands. Copy URL repo Anda, lalu run:

```bash
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"

# Add remote (ganti YOUR_USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/YOUR_USERNAME/fivem-tools-v7.git

# Push
git push -u origin main
```

**Contoh:**
```bash
git remote add origin https://github.com/boostfivem4-oss/fivem-tools-v7.git
git push -u origin main
```

---

## 📋 Option 2: Use Existing Repository

Jika repo `boostfivem4-oss/fivem` sudah ada:

### Step 1: Verify Repository Exists
1. Go to: **https://github.com/boostfivem4-oss/fivem**
2. Check if repo exists and you have access

### Step 2: Push Code
```bash
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"

# Remove old remote (if any)
git remote remove origin

# Add correct remote
git remote add origin https://github.com/boostfivem4-oss/fivem.git

# Push (force if needed)
git push -u origin main --force
```

---

## 📋 Option 3: GitHub CLI (Easiest)

### Step 1: Install GitHub CLI
Download from: **https://cli.github.com/**

### Step 2: Login
```bash
gh auth login
```
Follow prompts to login with browser

### Step 3: Create & Push
```bash
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"

# Create repo and push in one command
gh repo create fivem-tools-v7 --public --source=. --push
```

---

## 🔐 Authentication Issues?

### If you get "Authentication failed":

**Option A: Use Personal Access Token**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Copy token
5. When pushing, use token as password:
   ```bash
   Username: your-github-username
   Password: ghp_your_token_here
   ```

**Option B: Use SSH**
1. Generate SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Add to GitHub: https://github.com/settings/keys
3. Change remote to SSH:
   ```bash
   git remote set-url origin git@github.com:boostfivem4-oss/fivem.git
   git push -u origin main
   ```

---

## ✅ Verification

After successful push, verify:

1. **Check GitHub:**
   - Go to your repo URL
   - Should see all 135 files
   - Check README.md displays correctly

2. **Check Commit:**
   - Should see commit: "Deploy: FiveM Tools V7 - Complete with all features"
   - All files should be there

---

## 🚀 Next Steps After Push

### 1. Deploy to Vercel
```
1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Configure:
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: dist
5. Add Environment Variables (see below)
6. Click "Deploy"
```

### 2. Environment Variables for Vercel
```env
VITE_API_KEY=0331b989b68d4f18b88add514f4e6803
VITE_APP_ID=692c9d27fcb03e0d2d610054
VITE_DISCORD_CLIENT_ID=1442938080473645107
VITE_DISCORD_CLIENT_SECRET=QTx5ec8Zo2mhRjAfs1Wbuca6a30XeyrB
VITE_DISCORD_REDIRECT_URI=https://fivemtools.net/auth/callback
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1445328264615952496/2amowz5IfdHXgn6tq-nt-D8sQj30GQiIWaV2yVQgvP-Pl4TbR3WZEKvMX39E1w6_sIzu
```

---

## 🆘 Troubleshooting

### Error: "Repository not found"
**Cause:** Repo doesn't exist or you don't have access

**Solution:**
1. Create new repo at https://github.com/new
2. Or check if you're logged in to correct account
3. Or verify repo URL is correct

### Error: "Permission denied"
**Cause:** Not authenticated

**Solution:**
1. Use GitHub CLI: `gh auth login`
2. Or use Personal Access Token
3. Or setup SSH keys

### Error: "Failed to push"
**Cause:** Remote has changes you don't have

**Solution:**
```bash
git pull origin main --rebase
git push -u origin main
```

Or force push (if you're sure):
```bash
git push -u origin main --force
```

---

## 📝 Quick Commands Reference

```bash
# Check git status
git status

# Check remote
git remote -v

# Remove remote
git remote remove origin

# Add remote
git remote add origin https://github.com/USERNAME/REPO.git

# Push
git push -u origin main

# Force push
git push -u origin main --force

# Pull
git pull origin main
```

---

## 🎯 Recommended: Create New Repo

**Easiest path:**

1. **Create repo:** https://github.com/new
   - Name: `fivem-tools-v7`
   - Public
   - No README/gitignore

2. **Copy the URL** GitHub shows (e.g., `https://github.com/YOUR_USERNAME/fivem-tools-v7.git`)

3. **Run these commands:**
   ```bash
   cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"
   git remote add origin YOUR_REPO_URL_HERE
   git push -u origin main
   ```

4. **Done!** Proceed to Vercel deployment

---

**Status: Ready to push! Choose an option above 🚀**
