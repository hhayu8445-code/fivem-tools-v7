@echo off
chcp 65001 >nul
echo ========================================
echo   FIX CREDENTIAL DAN PUSH KE GITHUB
echo ========================================
echo.
echo Repository: https://github.com/hhayu8445-code/fivem-tools-v7
echo.
echo LANGKAH 1: Hapus Credential Lama
echo ========================================
echo.
echo Membuka Windows Credential Manager...
echo.
rundll32.exe keymgr.dll,KRShowKeyMgr
echo.
echo INSTRUKSI:
echo 1. Cari "git:https://github.com"
echo 2. Klik "Remove" atau "Hapus"
echo 3. Close Credential Manager
echo 4. Tekan Enter untuk lanjut
echo.
pause
echo.
echo.
echo LANGKAH 2: Push ke GitHub
echo ========================================
echo.
echo Sekarang akan push ke GitHub...
echo Browser akan terbuka untuk login
echo.
echo PENTING: Login dengan account hhayu8445-code
echo.
pause
echo.
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"
git push -u origin main --force
echo.
if errorlevel 1 (
    echo.
    echo ========================================
    echo   PUSH GAGAL!
    echo ========================================
    echo.
    echo Coba cara alternatif:
    echo.
    echo OPTION 1: Gunakan GitHub CLI
    echo   1. Download: https://cli.github.com/
    echo   2. Install
    echo   3. Run: gh auth login
    echo   4. Login dengan hhayu8445-code
    echo   5. Run: git push origin main --force
    echo.
    echo OPTION 2: Gunakan Personal Access Token
    echo   1. Buat token: https://github.com/settings/tokens
    echo   2. Copy token
    echo   3. Run: git remote set-url origin https://TOKEN@github.com/hhayu8445-code/fivem-tools-v7.git
    echo   4. Run: git push origin main --force
    echo.
    pause
    exit /b 1
)
echo.
echo ========================================
echo   PUSH BERHASIL! ✅
echo ========================================
echo.
echo Repository: https://github.com/hhayu8445-code/fivem-tools-v7
echo.
echo.
echo LANGKAH 3: Deploy ke Vercel
echo ========================================
echo.
echo 1. Buka: https://vercel.com/new
echo 2. Import repository: hhayu8445-code/fivem-tools-v7
echo 3. Framework Preset: Vite
echo 4. Build Command: npm run build
echo 5. Output Directory: dist
echo 6. Add Environment Variables:
echo.
echo    VITE_API_KEY=your_base44_api_key
echo    VITE_APP_ID=your_base44_app_id
echo    VITE_DISCORD_CLIENT_ID=your_discord_client_id
echo    VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret
echo    VITE_DISCORD_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
echo    VITE_DISCORD_WEBHOOK_URL=your_discord_webhook_url
echo.
echo 7. Click Deploy
echo.
echo.
echo Membuka Vercel...
start https://vercel.com/new
echo.
echo ========================================
echo   SELESAI!
echo ========================================
echo.
pause
