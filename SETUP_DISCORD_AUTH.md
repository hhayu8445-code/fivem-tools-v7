# Setup Discord OAuth2 Authentication

## 1. Buat Discord Application

1. Buka https://discord.com/developers/applications
2. Klik "New Application"
3. Beri nama aplikasi (contoh: "FiveM Tools V7")
4. Klik "Create"

## 2. Setup OAuth2

1. Di sidebar, klik "OAuth2"
2. Copy **Client ID** dan **Client Secret**
3. Di bagian "Redirects", tambahkan:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

## 3. Setup Environment Variables

1. Copy file `.env.example` menjadi `.env`
2. Isi dengan credentials Discord:

```env
VITE_API_KEY=0331b989b68d4f18b88add514f4e6803
VITE_APP_ID=692c9d27fcb03e0d2d610054

VITE_DISCORD_CLIENT_ID=your_client_id_here
VITE_DISCORD_CLIENT_SECRET=your_client_secret_here
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
```

## 4. OAuth2 Scopes

Aplikasi ini menggunakan scopes berikut:
- `identify` - Mendapatkan username dan ID user
- `email` - Mendapatkan email user
- `guilds` - Melihat server Discord user (opsional)

## 5. Testing

1. Jalankan aplikasi: `npm run dev`
2. Klik tombol "Login with Discord"
3. Authorize aplikasi
4. Anda akan di-redirect ke `/auth/callback` dan kemudian ke `/dashboard`

## 6. Production Deployment

Untuk production:
1. Update `VITE_DISCORD_REDIRECT_URI` dengan domain production
2. Tambahkan redirect URI di Discord Developer Portal
3. Pastikan `.env` tidak ter-commit ke git
4. Set environment variables di hosting platform

## Security Notes

⚠️ **PENTING:**
- Jangan expose `VITE_DISCORD_CLIENT_SECRET` di frontend
- Untuk production, gunakan backend proxy untuk token exchange
- Implementasi ini menggunakan client-side flow untuk demo
- Untuk keamanan maksimal, pindahkan token exchange ke backend

## Troubleshooting

**Error: "Invalid redirect_uri"**
- Pastikan redirect URI di Discord app settings sama persis dengan `.env`

**Error: "Invalid client"**
- Periksa Client ID dan Client Secret sudah benar

**User tidak ter-save**
- Periksa Base44 API credentials sudah benar
- Cek console browser untuk error messages
