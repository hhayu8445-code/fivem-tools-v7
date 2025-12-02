# 🌐 Setup DNS di cPanel untuk Vercel

## 📋 Langkah-langkah Setup DNS

### Step 1: Login ke cPanel
1. Buka cPanel Anda (biasanya: `https://fivemtools.net:2083` atau `https://yourdomain.com/cpanel`)
2. Login dengan username & password cPanel

---

### Step 2: Buka Zone Editor
1. Scroll ke bagian **"Domains"**
2. Klik **"Zone Editor"** atau **"Advanced DNS Zone Editor"**
3. Pilih domain: **fivemtools.net**

---

### Step 3: Hapus CNAME www yang Lama (WAJIB!)
**PENTING:** Anda HARUS hapus CNAME www yang lama dulu!

**Error yang Anda alami:**
```
Only 1 "CNAME" record may exist per name.
Rename or delete www.fivemtools.net.'s extra "CNAME" record.
```

**Solusi:**
1. Di Zone Editor, cari record dengan Name: `www`
2. Klik **"Delete"** atau icon **trash/sampah** di sebelah record tersebut
3. Confirm deletion
4. Setelah dihapus, baru lanjut ke Step 4

**Juga hapus jika ada:**
- A record untuk `@` atau `fivemtools.net` (yang mengarah ke IP lama)
- A record untuk `www` (jika ada)

---

### Step 4: Tambah A Record untuk Root Domain

**Klik "Add Record" atau "+ A Record"**

```
Type: A
Name: @ (atau kosongkan, atau ketik: fivemtools.net)
Address/Value: 76.76.21.21
TTL: 14400 (atau biarkan default)
```

**Klik "Add Record" atau "Save"**

---

### Step 5: Tambah CNAME Record untuk WWW

**Klik "Add Record" atau "+ CNAME Record"**

```
Type: CNAME
Name: www
CNAME/Value: cname.vercel-dns.com
TTL: 14400 (atau biarkan default)
```

**Klik "Add Record" atau "Save"**

---

### Step 6: Verifikasi DNS Records

Setelah selesai, Anda harus punya 2 record:

| Type | Name | Value |
|------|------|-------|
| A | @ atau fivemtools.net | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

---

## 🔄 Alternative: Menggunakan Nameservers Vercel (Recommended)

Jika cara di atas tidak work, gunakan Vercel Nameservers:

### Step 1: Di cPanel
1. Buka **"Zone Editor"**
2. Klik **"Manage"** pada domain fivemtools.net
3. Catat semua DNS records (backup!)

### Step 2: Ubah Nameservers
1. Login ke **Domain Registrar** Anda (tempat beli domain)
2. Cari menu **"Nameservers"** atau **"DNS Management"**
3. Ubah nameservers ke:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. Save changes

### Step 3: Di Vercel
1. Go to Vercel Dashboard
2. Project → Settings → Domains
3. Add domain: `fivemtools.net`
4. Vercel akan auto-configure DNS

---

## ⏱️ Waktu Propagasi

- **DNS propagation:** 5-30 menit (bisa sampai 48 jam)
- **Check status:** https://dnschecker.org

---

## 🔍 Troubleshooting cPanel

### Issue 1: Tidak bisa tambah A record
**Solusi:**
- Pastikan tidak ada A record lama dengan name yang sama
- Hapus dulu record lama, baru tambah yang baru

### Issue 2: CNAME conflict ⚠️ (ERROR ANDA)
**Error:** "Only 1 CNAME record may exist per name"

**Penyebab:**
Sudah ada CNAME record untuk `www` yang mengarah ke hosting lama

**Solusi LENGKAP:**
```
1. Di cPanel → Zone Editor → fivemtools.net
2. Cari record dengan Name: "www" dan Type: "CNAME"
3. Klik "Delete" atau icon trash di sebelah record tersebut
4. Tunggu 1-2 menit
5. Refresh halaman
6. Sekarang tambah CNAME baru:
   - Name: www
   - Value: cname.vercel-dns.com
7. Save
```

**Jika masih error:**
- Logout dari cPanel
- Login lagi
- Coba hapus dan tambah lagi

### Issue 3: Domain masih ke hosting lama
**Solusi:**
- Clear browser cache
- Tunggu DNS propagation (30 menit)
- Test di incognito mode
- Check: https://dnschecker.org

### Issue 4: SSL Certificate Error
**Solusi:**
- Tunggu 5-10 menit setelah DNS propagation
- Vercel akan auto-generate SSL certificate
- Jika masih error, contact Vercel support

---

## 📸 Screenshot Guide

### cPanel Zone Editor:
```
1. Login cPanel
2. Domains → Zone Editor
3. Manage → fivemtools.net
4. Add Record:
   - Type: A
   - Name: @
   - Points to: 76.76.21.21
5. Add Record:
   - Type: CNAME
   - Name: www
   - Points to: cname.vercel-dns.com
6. Save
```

---

## ✅ Verification Steps

### 1. Check DNS Records
```bash
# Windows Command Prompt
nslookup fivemtools.net
nslookup www.fivemtools.net

# Should show:
# fivemtools.net → 76.76.21.21
# www.fivemtools.net → cname.vercel-dns.com
```

### 2. Check Online
- Go to: https://dnschecker.org
- Enter: `fivemtools.net`
- Should show: `76.76.21.21` globally

### 3. Test Website
- Visit: https://fivemtools.net
- Visit: https://www.fivemtools.net
- Both should load your site

---

## 🎯 Quick Reference

### DNS Records Needed:
```
A Record:
- Name: @ (or fivemtools.net)
- Value: 76.76.21.21

CNAME Record:
- Name: www
- Value: cname.vercel-dns.com
```

### Vercel IP Address:
```
76.76.21.21
```

### Vercel CNAME:
```
cname.vercel-dns.com
```

---

## 📞 Need Help?

### cPanel Issues:
- Contact your hosting provider support
- Check cPanel documentation

### Vercel Issues:
- Vercel Support: https://vercel.com/support
- Vercel Docs: https://vercel.com/docs/concepts/projects/custom-domains

### DNS Issues:
- Check propagation: https://dnschecker.org
- Wait 24-48 hours for full propagation
- Clear browser cache

---

## 🚀 After DNS Setup

1. **Wait 5-30 minutes** for DNS propagation
2. **Deploy to Vercel** (if not done yet)
3. **Add domain in Vercel:**
   - Vercel Dashboard → Project → Settings → Domains
   - Add: `fivemtools.net`
   - Vercel will verify DNS automatically
4. **Test your site:**
   - https://fivemtools.net
   - https://www.fivemtools.net

---

## ⚠️ Important Notes

1. **Backup DNS records** sebelum mengubah apapun
2. **Jangan hapus MX records** (untuk email)
3. **Jangan hapus TXT records** (untuk verifikasi)
4. **Hanya ubah A dan CNAME** untuk website
5. **Tunggu propagasi** sebelum test

---

**Status: Ready to configure DNS! 🌐**

Follow steps above in your cPanel.
