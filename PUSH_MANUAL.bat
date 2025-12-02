@echo off
echo ========================================
echo   PUSH TO GITHUB - MANUAL STEPS
echo ========================================
echo.
echo Repository sudah dibuat di:
echo https://github.com/boostfivem4-oss/fivem-tools-v7
echo.
echo ========================================
echo   OPTION 1: PUSH DENGAN BROWSER LOGIN
echo ========================================
echo.
echo Jalankan commands ini satu per satu:
echo.
echo 1. cd "c:\Users\MUDDING UNDERGROUND\Pictures\runkzerigala\DENGNA"
echo.
echo 2. git remote remove origin
echo.
echo 3. git remote add origin https://github.com/boostfivem4-oss/fivem-tools-v7.git
echo.
echo 4. git push -u origin main
echo.
echo Saat diminta login:
echo - Akan muncul browser window
echo - Login dengan GitHub account Anda
echo - Authorize Git Credential Manager
echo - Kembali ke terminal, push akan otomatis
echo.
pause
echo.
echo ========================================
echo   OPTION 2: PUSH DENGAN TOKEN
echo ========================================
echo.
echo 1. Buat Personal Access Token:
echo    https://github.com/settings/tokens
echo.
echo 2. Click: Generate new token (classic)
echo.
echo 3. Select scopes: repo, workflow
echo.
echo 4. Copy token (ghp_xxxxx...)
echo.
echo 5. Run push command
echo.
echo 6. Saat diminta:
echo    Username: boostfivem4-oss
echo    Password: [paste token Anda]
echo.
pause
echo.
echo ========================================
echo   OPTION 3: GITHUB CLI (TERMUDAH!)
echo ========================================
echo.
echo 1. Download GitHub CLI:
echo    https://cli.github.com/
echo.
echo 2. Install
echo.
echo 3. Run: gh auth login
echo.
echo 4. Pilih: GitHub.com - HTTPS - Login with browser
echo.
echo 5. Run: gh repo create fivem-tools-v7 --public --source=. --push
echo.
pause
echo.
echo ========================================
echo   READY TO TRY?
echo ========================================
echo.
echo Pilih salah satu option di atas!
echo.
pause
