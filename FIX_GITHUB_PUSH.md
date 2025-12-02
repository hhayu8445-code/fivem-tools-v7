# 🔧 Fix GitHub Push - Permission Denied

## ❌ Masalah
```
remote: Permission to hhayu8445-code/fivem-tools-v7.git denied to valakrunk-cpu.
fatal: unable to access 'https://github.com/hhayu8445-code/fivem-tools-v7.git/': The requested URL returned error: 403
```

**Penyebab:** Git menggunakan credential user `valakrunk-cpu` tapi repository milik `hhayu8445-code`

---

## ✅ SOLUSI 1: Update Git Credentials (RECOMMENDED)

### Step 1: Hapus Credential Lama
```bash
# Windows Credential Manager
rundll32.exe keymgr.dll,KRShowKeyMgr
```
1. Cari "git:https://github.com"
2. Klik "Remove"
3. Close

### Step 2: Push Lagi (akan minta login baru)
```bash
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"

git push -u origin main --force
```
- Browser akan terbuka
- Login dengan account `hhayu8445-code`
- Authorize
- Push akan otomatis lanjut

---

## ✅ SOLUSI 2: Gunakan Personal Access Token

### Step 1: Buat Token
1. Login GitHub sebagai `hhayu8445-code`
2. Go to: https://github.com/settings/tokens
3. Click "Generate new token (classic)"
4. Name: `fivem-tools-v7-deploy`
5. Expiration: 90 days
6. Select scopes:
   - ✅ repo (all)
   - ✅ workflow
7. Click "Generate token"
8. **COPY TOKEN** (ghp_xxxxxxxxxxxx)

### Step 2: Push dengan Token
```bash
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"

# Format: https://TOKEN@github.com/USER/REPO.git
git remote set-url origin https://ghp_YOUR_TOKEN_HERE@github.com/hhayu8445-code/fivem-tools-v7.git

git push -u origin main --force
```

---

## ✅ SOLUSI 3: Gunakan GitHub CLI (PALING MUDAH)

### Step 1: Install GitHub CLI
Download: https://cli.github.com/

### Step 2: Login
```bash
gh auth login
```
- Pilih: GitHub.com
- Pilih: HTTPS
- Pilih: Login with a web browser
- Copy code yang muncul
- Paste di browser
- Login sebagai `hhayu8445-code`
- Authorize

### Step 3: Push
```bash
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"

git push -u origin main --force
```

---

## ✅ SOLUSI 4: Gunakan SSH (Advanced)

### Step 1: Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
- Press Enter (default location)
- Enter passphrase (optional)

### Step 2: Add SSH Key ke GitHub
```bash
# Copy public key
type %USERPROFILE%\.ssh\id_ed25519.pub
```
1. Copy output
2. Go to: https://github.com/settings/keys
3. Click "New SSH key"
4. Paste key
5. Save

### Step 3: Change Remote to SSH
```bash
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"

git remote set-url origin git@github.com:hhayu8445-code/fivem-tools-v7.git

git push -u origin main --force
```

---

## 🎯 REKOMENDASI

**Gunakan SOLUSI 1** (paling simple):
1. Hapus credential lama di Windows Credential Manager
2. Push lagi
3. Login dengan account yang benar

Atau **SOLUSI 3** (paling mudah):
1. Install GitHub CLI
2. Login dengan `gh auth login`
3. Push

---

## 📋 Setelah Berhasil Push

### 1. Verify di GitHub
```
https://github.com/hhayu8445-code/fivem-tools-v7
```

### 2. Deploy ke Vercel
```
1. Go to: https://vercel.com/new
2. Import: hhayu8445-code/fivem-tools-v7
3. Framework: Vite
4. Add environment variables
5. Deploy
```

### 3. Environment Variables
```
VITE_API_KEY=your_base44_api_key
VITE_APP_ID=your_base44_app_id
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret
VITE_DISCORD_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
VITE_DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

---

## ✅ Status Saat Ini

- ✅ Code cleanup: COMPLETE
- ✅ Build test: SUCCESS
- ✅ Git commit: DONE
- ✅ Remote setup: DONE
- ⏳ Push to GitHub: WAITING (credential issue)
- ⏳ Deploy to Vercel: WAITING

---

## 📞 Butuh Bantuan?

Discord: https://discord.gg/WYR27uKFns

---

**Repository:** https://github.com/hhayu8445-code/fivem-tools-v7
**Status:** Ready to push (fix credential first)
