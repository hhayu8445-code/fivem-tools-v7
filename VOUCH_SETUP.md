# 🔐 Vouch System Setup Guide

## ✅ Perbaikan yang Sudah Dilakukan

### 1. **Entity VouchMessage**
Dibuat entity baru untuk menyimpan data vouch dari Discord:
- `discord_user_id` - Discord ID user
- `discord_username` - Username Discord
- `channel_id` - ID channel Discord tempat vouch
- `message_id` - ID message vouch
- `message_link` - Link lengkap message vouch
- `vouch_text` - Isi pesan vouch
- `verified` - Status verifikasi (true/false)
- `created_date` - Tanggal dibuat

### 2. **Validasi Vouch Wajib**
- User HARUS verify vouch sebelum bisa decrypt
- Vouch harus dari channel Discord yang valid
- Sistem auto-check apakah vouch sudah ada
- Satu vouch hanya bisa dipakai oleh satu user

### 3. **UI/UX Improvements**
- ✅ Tata letak lebih rapi dan terstruktur
- ✅ Step-by-step guide untuk vouch
- ✅ Visual feedback (verified badge)
- ✅ Better error messages
- ✅ File info display dengan icon
- ✅ Improved button states

## 🚀 Setup Instructions

### Step 1: Buat Entity di Base44

1. Login ke https://app.base44.com
2. Pilih project "FiveM Tools V7"
3. Buat entity baru dengan nama: **VouchMessage**
4. Tambahkan fields:

```
discord_user_id: String (Required)
discord_username: String (Required)
channel_id: String (Required)
message_id: String (Required)
message_link: String (Required)
vouch_text: String (Required)
verified: Boolean (Default: false)
created_date: Date (Default: now)
```

### Step 2: Update Channel ID

Edit file `src/Pages/DecryptAssets.jsx` line ~50:

```javascript
const VALID_CHANNEL_IDS = [
  '1445328264615952493', // Ganti dengan ID channel #vouch Anda
  'CHANNEL_ID_2'         // Tambahkan channel lain jika perlu
];
```

**Cara mendapatkan Channel ID:**
1. Buka Discord Developer Mode (Settings → Advanced → Developer Mode)
2. Right-click channel #vouch → Copy ID
3. Paste ID tersebut ke array `VALID_CHANNEL_IDS`

### Step 3: Setup Discord Channel

1. Buat channel baru di Discord server: `#vouch`
2. Set permissions:
   - Everyone: Read Messages, Send Messages
   - Bot: Read Messages, Manage Messages
3. Pin message dengan instruksi vouch

**Contoh Pin Message:**
```
📝 **How to Post Vouch**

To use our decrypt service, you must post a vouch message here:

1. Share your experience using our service
2. Be honest and constructive
3. Copy the message link after posting
4. Paste it on the decrypt page

Example: "Great service! Fast decrypt and very secure. Highly recommended!"
```

## 📋 User Flow

### Untuk User Baru:
1. Login dengan Discord
2. Buka halaman Decrypt Assets
3. Lihat section "Discord Vouch Required"
4. Klik "Join Discord Server"
5. Post vouch di channel #vouch
6. Copy message link (Right-click → Copy Message Link)
7. Paste link di form "Vouch Message Link"
8. Klik "Verify Vouch"
9. Jika valid, status berubah "Verified" ✅
10. Upload file dan decrypt

### Untuk User yang Sudah Punya Vouch:
1. Login dengan Discord
2. Sistem auto-detect vouch yang sudah ada
3. Langsung bisa upload dan decrypt

## 🔒 Security Features

- ✅ Validasi format Discord link
- ✅ Validasi channel ID (harus dari server resmi)
- ✅ Satu vouch = satu user (tidak bisa dipakai user lain)
- ✅ Auto-save vouch ke database
- ✅ Persistent verification (tidak perlu verify ulang)

## 🐛 Troubleshooting

### Error: "Invalid Discord message link format"
- Pastikan link format: `https://discord.com/channels/SERVER_ID/CHANNEL_ID/MESSAGE_ID`
- Copy link dengan cara: Right-click message → Copy Message Link

### Error: "Vouch must be from the official vouch channel"
- Pastikan post vouch di channel yang benar (#vouch)
- Update `VALID_CHANNEL_IDS` dengan channel ID yang benar

### Error: "This vouch belongs to another user"
- Vouch sudah dipakai user lain
- Post vouch baru dengan akun Discord Anda

### Error: "Failed to verify vouch"
- Check koneksi internet
- Pastikan Base44 entity VouchMessage sudah dibuat
- Check console untuk error detail

## 📊 Admin Features

Admin bisa melihat semua vouch di database:
1. Login ke Base44 dashboard
2. Pilih entity "VouchMessage"
3. Lihat semua vouch yang sudah verified
4. Filter by user, channel, atau date

## 🎯 Next Steps

1. ✅ Deploy ke Vercel (sudah otomatis)
2. ⏳ Buat entity VouchMessage di Base44
3. ⏳ Update VALID_CHANNEL_IDS dengan channel ID yang benar
4. ⏳ Setup channel #vouch di Discord
5. ⏳ Test vouch system
6. ⏳ Announce ke community

---

**Status:** ✅ Code deployed, waiting for Base44 entity setup
**Version:** 7.0.1
**Last Updated:** 2024
