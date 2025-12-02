@echo off
echo ========================================
echo   PUSH KE GITHUB - SIMPLE
echo ========================================
echo.
echo Repository: https://github.com/hhayu8445-code/fivem-tools-v7
echo.
echo STEP 1: Hapus Credential Lama
echo ========================================
echo.
echo Membuka Credential Manager...
echo.
echo INSTRUKSI:
echo 1. Cari "git:https://github.com"
echo 2. Klik panah dropdown
echo 3. Klik "Remove" atau "Hapus"
echo 4. Close window
echo.
start control /name Microsoft.CredentialManager
echo.
echo Tekan Enter setelah selesai hapus credential...
pause >nul
echo.
echo.
echo STEP 2: Push ke GitHub
echo ========================================
echo.
echo Browser akan terbuka untuk login
echo Login dengan: hhayu8445-code
echo.
pause
echo.
cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"
git push -u origin main --force
echo.
if errorlevel 1 (
    echo.
    echo GAGAL! Baca file: HAPUS_CREDENTIAL.txt
    echo.
    pause
    exit /b 1
)
echo.
echo ========================================
echo   BERHASIL! ✅
echo ========================================
echo.
echo Buka: https://github.com/hhayu8445-code/fivem-tools-v7
echo.
echo Deploy ke Vercel: https://vercel.com/new
echo.
pause
