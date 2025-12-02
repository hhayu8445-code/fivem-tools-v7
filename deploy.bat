@echo off
echo ========================================
echo   FiveM Tools V7 - Auto Deploy Script
echo ========================================
echo.

echo [1/5] Checking Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/
    pause
    exit /b 1
)
echo Git found!
echo.

echo [2/5] Initializing Git repository...
if not exist .git (
    git init
    echo Git initialized!
) else (
    echo Git already initialized!
)
echo.

echo [3/5] Adding files to Git...
git add .
echo Files added!
echo.

echo [4/5] Committing changes...
git commit -m "Deploy: FiveM Tools V7 - All features complete"
echo Committed!
echo.

echo [5/5] Checking Vercel CLI...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo Vercel CLI not found!
    echo Installing Vercel CLI...
    npm install -g vercel
)
echo.

echo ========================================
echo   Ready to Deploy!
echo ========================================
echo.
echo Next steps:
echo 1. Push to GitHub (if not done):
echo    git remote add origin https://github.com/YOUR_USERNAME/fivemtools-v7.git
echo    git push -u origin main
echo.
echo 2. Deploy to Vercel:
echo    vercel --prod
echo.
echo Or visit: https://vercel.com/new
echo.
pause
