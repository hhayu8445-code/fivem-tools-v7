# 🚀 SETUP FINAL - Discord OAuth & Vercel

## ✅ **STEP 1: Setup Discord OAuth**

### **Go to:** https://discord.com/developers/applications/1442938080473645107

### **Klik: OAuth2 → General**

### **Di bagian "Redirects", tambahkan 2 URI ini:**

```
https://fivemtools.net/auth/callback
https://www.fivemtools.net/auth/callback
```

**Cara:**
1. Klik "Add Redirect"
2. Paste: `https://fivemtools.net/auth/callback`
3. Klik "Add"
4. Klik "Add Redirect" lagi
5. Paste: `https://www.fivemtools.net/auth/callback`
6. Klik "Add"
7. **Klik "Save Changes"** di bagian bawah

---

## ✅ **STEP 2: Import Environment Variables ke Vercel**

### **Go to:** https://vercel.com/dashboard

### **Pilih project Anda**

### **Settings → Environment Variables**

### **Scroll ke bawah, cari "Bulk Import" atau klik "Add New"**

### **Copy-Paste ini:**

```
VITE_API_KEY=0331b989b68d4f18b88add514f4e6803
VITE_APP_ID=692c9d27fcb03e0d2d610054
VITE_DISCORD_CLIENT_ID=1442938080473645107
VITE_DISCORD_CLIENT_SECRET=QTx5ec8Zo2mhRjAfs1Wbuca6a30XeyrB
VITE_DISCORD_REDIRECT_URI=https://www.fivemtools.net/auth/callback
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1445328264615952496/2amowz5IfdHXgn6tq-nt-D8sQj30GQiIWaV2yVQgvP-Pl4TbR3WZEKvMX39E1w6_sIzu
```

### **Select Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

### **Klik "Import" atau "Save"**

---

## ✅ **STEP 3: Redeploy**

### **Go to: Deployments tab**

### **Klik "..." pada deployment terakhir**

### **Klik "Redeploy"**

### **Wait 2-3 minutes**

---

## ✅ **STEP 4: Test Login**

1. **Go to:** https://fivemtools.net
2. **Atau:** https://www.fivemtools.net
3. **Klik:** "Login with Discord"
4. **Should work!** ✅

---

## 📋 **Checklist:**

- [ ] Discord: Tambah redirect URI (2 URLs)
- [ ] Discord: Save Changes
- [ ] Vercel: Import environment variables
- [ ] Vercel: Redeploy
- [ ] Test: Login Discord works

---

## 🎯 **Expected Result:**

```
User clicks "Login with Discord"
    ↓
Redirect to Discord authorization
    ↓
User authorizes
    ↓
Redirect back to: https://www.fivemtools.net/auth/callback
    ↓
User logged in! ✅
```

---

**Status: Ready to setup! Follow steps above.** 🚀
