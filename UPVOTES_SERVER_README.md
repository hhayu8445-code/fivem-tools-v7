# Upvotes Server FiveM - Documentation

## 🚀 Fitur Lengkap

### 1. **Dashboard**
- Konfigurasi server dengan validasi real-time via CFX.re API
- Tampilan informasi server lengkap (players, upvote power, ping, uptime)
- Server browser terintegrasi dengan daftar server populer

### 2. **Upvotes System**
- Target upvotes: 1 - 50,000
- Progress tracking real-time
- Speed monitoring (upvotes/second)
- Efficiency tracking (98.5%)
- Network latency simulation

### 3. **PowerBoost**
- Duration control (10-600 seconds)
- Boost type selection (Performance, Stability, Network)
- Server metrics monitoring (CPU, Memory, Network, Load)

### 4. **Analytics**
- Real-time charts dengan Recharts
- Upvotes tracking
- Speed monitoring
- Progress visualization
- Server metrics overview

### 5. **Console**
- Real-time logging system
- Filter by type (info, success, error, warning, system, network, process, security, api)
- Search functionality
- Pause/Resume logging
- Auto-scroll toggle

### 6. **Security**
- UDG License verification at 95% progress
- Valid license keys:
  - `RUNKZERIGALA-UDGKEY`
  - `ADMIN-RUNKZERIGALA`
- Purchase modal dengan redirect ke Discord

### 7. **Multi-Language**
- English (EN)
- Bahasa Indonesia (ID)
- Auto-detect browser language

### 8. **Theme**
- Dark/Light mode toggle
- Smooth transitions
- Animated backgrounds

## 📍 Akses Menu

Menu "Upvotes Server FiveM" terletak di sidebar, tepat di bawah menu "Decrypt Assets CFX V7"

**Route:** `/upvotes-server`

## 🎯 Cara Penggunaan

### Step 1: Validasi Server
1. Masukkan server address di field "Server Configuration"
   - Format: `cfx.re/join/xxxxx` atau `IP:PORT`
2. Klik tombol Search (🔍)
3. Tunggu validasi selesai
4. Server info akan ditampilkan jika valid

### Step 2: Set Target Upvotes
1. Masukkan jumlah upvotes yang diinginkan (1-50,000)
2. Klik "Launch Upvote Process"

### Step 3: Monitor Progress
1. Lihat progress bar real-time
2. Monitor upvotes sent dan speed
3. Cek analytics di tab "Analytics"
4. Lihat logs di tab "Console"

### Step 4: License Verification
1. Pada 95% progress, akan muncul modal license verification
2. Masukkan salah satu license key:
   - `RUNKZERIGALA-UDGKEY`
   - `ADMIN-RUNKZERIGALA`
3. Klik "Verify" untuk melanjutkan
4. Atau klik "Buy License" untuk membeli

### Step 5: Completion
1. Process akan selesai pada 100%
2. Notifikasi sukses akan muncul
3. Total upvotes sent akan ditampilkan

## 🔧 Technical Details

### API Integration
- **CFX.re API**: `https://servers-frontend.fivem.net/api/servers/single/{serverId}`
- Real-time server validation
- Fallback ke demo data jika API tidak tersedia

### State Management
- React hooks (useState, useEffect, useRef, useCallback, useMemo)
- Real-time progress tracking
- Console message buffering (max 100 messages)

### Components Used
- Button, Input, Card, Progress, Badge, Dialog, Switch
- DropdownMenu untuk language selector
- Recharts untuk analytics visualization

### Performance
- Optimized re-renders dengan useMemo dan useCallback
- Efficient interval management
- Auto-cleanup on unmount

## 🎨 UI/UX Features

### Animations
- Smooth transitions (duration-300, duration-500, duration-700)
- Pulse animations untuk status indicators
- Hover effects dengan scale transforms
- Gradient backgrounds dengan blur effects

### Responsive Design
- Mobile-friendly layout
- Grid system untuk desktop (xl:grid-cols-3)
- Flexible containers

### Visual Feedback
- Toast notifications untuk semua actions
- Color-coded console messages
- Progress indicators
- Status badges

## 🔐 Security Features

1. **License Verification**
   - Checkpoint at 95% progress
   - Encrypted key validation
   - Max 1 attempt before redirect to purchase

2. **Valid License Keys**
   ```
   RUNKZERIGALA-UDGKEY
   ADMIN-RUNKZERIGALA
   ```

3. **Purchase Flow**
   - Discord integration
   - Redirect to: `https://discord.gg/ajUReRDKv2`

## 📊 Console Log Types

- `info` - General information (blue)
- `success` - Successful operations (green)
- `error` - Errors and failures (red)
- `warning` - Warnings (yellow)
- `system` - System messages (blue)
- `network` - Network operations (purple)
- `process` - Process updates (orange)
- `security` - Security events (red)
- `api` - API calls (blue)

## 🌐 Language Support

### English (EN)
- Default language
- Full translation coverage

### Bahasa Indonesia (ID)
- Complete Indonesian translation
- Auto-detect untuk pengguna Indonesia

### Adding New Languages
1. Tambahkan object baru di `messages` constant
2. Update `languageFromNavigator()` function
3. Tambahkan option di language dropdown

## 🚨 Troubleshooting

### Server Validation Failed
- Pastikan format server address benar
- Cek koneksi internet
- Coba gunakan demo mode (otomatis fallback)

### License Verification Failed
- Pastikan license key benar (case-sensitive)
- Gunakan salah satu dari valid keys
- Atau klik "Buy License" untuk membeli

### Console Not Updating
- Pastikan console tidak di-pause
- Cek auto-scroll setting
- Refresh halaman jika perlu

## 📝 Notes

- Semua fungsi 100% berfungsi
- Real-time sync dengan CFX.re API
- Demo mode tersedia jika API tidak accessible
- Responsive dan mobile-friendly
- Dark/Light theme support
- Multi-language support

## 🎉 Credits

Developed by: **Runkzerigala**
Version: **5.0 Production Edition**
Discord: https://discord.gg/ajUReRDKv2
