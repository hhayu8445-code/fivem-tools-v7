# ⚠️ FIX: CNAME Error di cPanel

## 🔴 Error yang Anda Alami:

```
Error:
Only 1 "CNAME" record may exist per name. 
Rename or delete www.fivemtools.net.'s extra "CNAME" record.
```

---

## ✅ Solusi (5 Langkah Simple):

### 1️⃣ Login ke cPanel
- Buka cPanel Anda
- Login dengan username & password

### 2️⃣ Buka Zone Editor
```
Domains → Zone Editor → Manage (fivemtools.net)
```

### 3️⃣ Cari CNAME www yang Lama
Cari record dengan:
- **Name:** `www` atau `www.fivemtools.net`
- **Type:** `CNAME`
- **Value:** (biasanya mengarah ke hosting lama)

### 4️⃣ Hapus CNAME Lama
- Klik **"Delete"** atau icon **🗑️ trash** di sebelah record
- Confirm deletion
- **Tunggu 1-2 menit**

### 5️⃣ Tambah CNAME Baru
Sekarang tambah CNAME baru:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 14400 (default)
```
Klik **"Add Record"** atau **"Save"**

---

## 🎯 Visual Guide:

```
┌─────────────────────────────────────────────────────────┐
│ Zone Editor - fivemtools.net                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Name          Type    Value                   Actions  │
│ ────────────  ──────  ──────────────────────  ────────│
│ www           CNAME   old-hosting.com         [Delete] │ ← HAPUS INI!
│                                                         │
└─────────────────────────────────────────────────────────┘

Setelah dihapus, tambah yang baru:

┌─────────────────────────────────────────────────────────┐
│ Add CNAME Record                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Name:  [www                              ]              │
│ Value: [cname.vercel-dns.com             ]              │
│ TTL:   [14400                            ]              │
│                                                         │
│                              [Add Record]               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting:

### Masalah 1: Tidak bisa hapus CNAME
**Solusi:**
- Logout dari cPanel
- Login lagi
- Coba hapus lagi

### Masalah 2: Masih error setelah hapus
**Solusi:**
- Tunggu 2-3 menit
- Refresh halaman (F5)
- Coba tambah CNAME baru lagi

### Masalah 3: Tidak menemukan CNAME www
**Solusi:**
- Cek di "Advanced DNS Zone Editor"
- Atau cari di semua records
- Mungkin ada di subdomain section

### Masalah 4: Error "Record already exists"
**Solusi:**
```
1. Clear browser cache
2. Logout & login cPanel
3. Hapus semua CNAME dengan name "www"
4. Tunggu 5 menit
5. Tambah CNAME baru
```

---

## ⚡ Alternative: Hapus via Command Line (Advanced)

Jika punya SSH access:

```bash
# Login via SSH
ssh username@fivemtools.net

# Edit zone file
nano /var/named/fivemtools.net.db

# Cari dan hapus baris:
# www    IN    CNAME    old-hosting.com

# Save (Ctrl+X, Y, Enter)

# Restart named
systemctl restart named
```

---

## 🎯 Checklist Setelah Fix:

- [ ] CNAME www lama sudah dihapus
- [ ] CNAME www baru sudah ditambah (cname.vercel-dns.com)
- [ ] A record @ sudah ditambah (76.76.21.21)
- [ ] Tunggu 5-10 menit untuk propagasi
- [ ] Test: `nslookup www.fivemtools.net`
- [ ] Test: Visit https://www.fivemtools.net

---

## ✅ Verification:

### Check DNS via Command:
```bash
# Windows Command Prompt
nslookup www.fivemtools.net

# Should return:
# www.fivemtools.net canonical name = cname.vercel-dns.com
```

### Check Online:
- Go to: https://dnschecker.org
- Enter: `www.fivemtools.net`
- Should show: `cname.vercel-dns.com`

---

## 📋 Complete DNS Records Needed:

Setelah fix, Anda harus punya 2 records:

| Type | Name | Value | Status |
|------|------|-------|--------|
| A | @ | 76.76.21.21 | ✅ Add this |
| CNAME | www | cname.vercel-dns.com | ✅ Add this (after deleting old) |

---

## 🆘 Masih Error?

### Option 1: Contact Hosting Support
- Minta mereka hapus CNAME www yang lama
- Minta mereka tambah CNAME baru ke cname.vercel-dns.com

### Option 2: Gunakan Vercel Nameservers
Lebih simple, ubah nameservers domain ke:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Cara:
1. Login ke domain registrar (tempat beli domain)
2. Cari "Nameservers" atau "DNS Management"
3. Ubah ke Vercel nameservers
4. Vercel akan auto-configure semua DNS

### Option 3: Gunakan A Record untuk www
Jika CNAME tetap error, gunakan A record:
```
Type: A
Name: www
Value: 76.76.21.21
```

---

## 📞 Support:

- **Hosting Support:** Contact your cPanel hosting provider
- **Vercel Support:** https://vercel.com/support
- **Discord:** https://discord.gg/WYR27uKFns

---

## 🎉 Setelah Fix Berhasil:

1. ✅ Lanjut ke Vercel Dashboard
2. ✅ Add domain: fivemtools.net
3. ✅ Vercel akan verify DNS
4. ✅ Wait 5-30 minutes
5. ✅ Test site: https://fivemtools.net

---

**Status: Error Fixed! Continue deployment 🚀**

Next: Add domain in Vercel Dashboard
