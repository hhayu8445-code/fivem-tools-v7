@echo off
echo ========================================
echo   Push to GitHub - FiveM Tools V7
echo ========================================
echo.

echo Repository: https://github.com/boostfivem4-oss/fivem.git
echo.

echo [1/4] Initializing Git...
git init
echo.

echo [2/4] Adding all files...
git add .
echo.

echo [3/4] Committing...
git commit -m "Deploy: FiveM Tools V7 - Complete with all features"
echo.

echo [4/4] Pushing to GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/boostfivem4-oss/fivem.git
git branch -M main
git push -u origin main --force
echo.

echo ========================================
echo   SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Repository: https://github.com/boostfivem4-oss/fivem
echo.
echo Next steps:
echo 1. Go to: https://vercel.com/new
echo 2. Import: boostfivem4-oss/fivem
echo 3. Add environment variables
echo 4. Deploy!
echo.
pause
