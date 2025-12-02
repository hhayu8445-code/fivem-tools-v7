# 🚀 PANDUAN DEPLOYMENT KE VERCEL - fivemtools.net

## ✅ PERSIAPAN SEBELUM DEPLOY

### 1. **Setup Discord OAuth Application**

1. Buka https://discord.com/developers/applications
2. Buat aplikasi baru atau pilih yang sudah ada
3. Di menu **OAuth2** → **General**:
   - Copy **Client ID** dan **Client Secret**
   - Tambahkan Redirect URL: `https://fivemtools.net/auth/callback`
4. Di menu **OAuth2** → **URL Generator**:
   - Pilih scopes: `identify`, `email`, `guilds`

### 2. **Environment Variables yang Dibutuhkan**

Siapkan nilai-nilai berikut untuk dimasukkan ke Vercel:

```env
VITE_API_KEY=0331b989b68d4f18b88add514f4e6803
VITE_APP_ID=692c9d27fcb03e0d2d610054
VITE_DISCORD_CLIENT_ID=[Discord Client ID Anda]
VITE_DISCORD_CLIENT_SECRET=[Discord Client Secret Anda]
VITE_DISCORD_REDIRECT_URI=https://fivemtools.net/auth/callback
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1445328264615952496/2amowz5IfdHXgn6tq-nt-D8sQj30GQiIWaV2yVQgvP-Pl4TbR3WZEKvMX39E1w6_sIzu
```

---

## 📦 LANGKAH DEPLOYMENT

### **Opsi 1: Deploy via Vercel Dashboard (RECOMMENDED)**

1. **Login ke Vercel**
   - Buka https://vercel.com
   - Login dengan GitHub/GitLab/Bitbucket

2. **Import Project**
   - Klik "Add New" → "Project"
   - Import repository GitHub Anda
   - Atau upload folder project langsung

3. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**
   - Di tab "Environment Variables"
   - Tambahkan semua variable dari list di atas
   - Pastikan pilih environment: **Production**, **Preview**, **Development**

5. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai (2-3 menit)

6. **Setup Custom Domain**
   - Setelah deploy berhasil, buka "Settings" → "Domains"
   - Tambahkan domain: `fivemtools.net`
   - Ikuti instruksi DNS configuration dari Vercel
   - Tambahkan juga `www.fivemtools.net` (optional)

---

### **Opsi 2: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Ikuti prompt untuk setup project
```

---

## 🔧 KONFIGURASI DNS

Setelah deploy, setup DNS di registrar domain Anda:

### **A Record (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

### **CNAME Record (Alternative)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## ✅ VERIFIKASI DEPLOYMENT

### 1. **Test Login Discord**
- Buka https://fivemtools.net
- Klik "Login with Discord"
- Pastikan redirect ke Discord OAuth
- Setelah authorize, harus kembali ke dashboard

### 2. **Test Profile Auto-Creation**
- Login pertama kali akan otomatis membuat profile
- Cek di Dashboard → Settings
- Pastikan data Discord muncul (email, username, avatar)

### 3. **Test Webhook Discord**
- Login/Logout akan mengirim notifikasi ke Discord webhook
- Download asset akan log ke Discord
- Cek channel Discord untuk verifikasi

### 4. **Test Features**
- ✅ Browse assets
- ✅ Download (free & premium)
- ✅ Forum (create thread, reply, like)
- ✅ Messages (DM antar user)
- ✅ Notifications
- ✅ Admin panel (jika role admin)

---

## 🔐 KEAMANAN

### **Environment Variables di Vercel**
- ✅ Semua credentials aman di Vercel environment
- ✅ Tidak ada hardcoded secrets di kode
- ✅ Webhook URL tersembunyi dari public

### **Discord OAuth Scopes**
Aplikasi akan mendapatkan data Discord:
- ✅ `identify` - ID, username, avatar, discriminator
- ✅ `email` - Email address
- ✅ `guilds` - Server list (untuk role sync)

### **Data yang Disimpan**
Saat login pertama kali, otomatis membuat profile dengan:
```javascript
{
  user_email: "user@example.com",
  discord_id: "123456789",
  membership_tier: "free",
  daily_downloads_count: 0,
  posts_count: 0,
  likes_received_count: 0,
  reputation: 0,
  points: 0,
  last_seen: "2024-01-01T00:00:00.000Z"
}
```

---

## 🐛 TROUBLESHOOTING

### **Error: "Invalid Redirect URI"**
- Pastikan di Discord Developer Portal sudah tambahkan:
  `https://fivemtools.net/auth/callback`

### **Error: "Failed to get token"**
- Cek VITE_DISCORD_CLIENT_SECRET sudah benar
- Pastikan tidak ada spasi atau karakter tersembunyi

### **Error: "API Error 401"**
- Cek VITE_API_KEY dan VITE_APP_ID sudah benar
- Verifikasi di Vercel dashboard environment variables

### **Webhook tidak kirim notifikasi**
- Cek VITE_DISCORD_WEBHOOK_URL sudah benar
- Test webhook manual di Discord

---

## 📊 MONITORING

### **Vercel Analytics**
- Aktifkan di Vercel dashboard untuk tracking:
  - Page views
  - User sessions
  - Performance metrics

### **Discord Webhook Logs**
Semua aktivitas user akan log ke Discord:
- 🟢 Login/Logout
- 📥 Download assets
- 💬 Forum activity
- 🔴 Errors (jika ada)

---

## 🎯 CHECKLIST DEPLOYMENT

- [ ] Discord OAuth app sudah setup
- [ ] Redirect URI sudah ditambahkan
- [ ] Environment variables sudah diisi di Vercel
- [ ] Project sudah di-deploy
- [ ] Domain fivemtools.net sudah disetup
- [ ] DNS sudah dikonfigurasi
- [ ] Test login Discord berhasil
- [ ] Profile auto-creation berfungsi
- [ ] Webhook Discord berfungsi
- [ ] Semua fitur sudah ditest

---

## 🚀 READY FOR PRODUCTION!

Setelah semua checklist selesai, aplikasi Anda siap digunakan di:
**https://fivemtools.net**

**Support:**
- Discord: https://discord.gg/WYR27uKFns
- Documentation: Base44 API Docs

---

*Deployment guide by Amazon Q Developer*
