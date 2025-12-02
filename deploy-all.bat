@echo off
chcp 65001 >nul
echo ========================================
echo   FiveM Tools V7 - Deploy Script
echo ========================================
echo.

:menu
echo Select deployment option:
echo.
echo [1] Push to GitHub
echo [2] Deploy to Vercel
echo [3] Full Deploy (GitHub + Vercel)
echo [4] Exit
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto github
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto full
if "%choice%"=="4" goto end
goto menu

:github
echo.
echo ========================================
echo   Pushing to GitHub
echo ========================================
echo.
git add .
git commit -m "Deploy: FiveM Tools V7 - %date% %time%"
git push origin main
if errorlevel 1 (
    echo.
    echo ERROR: Push failed!
    echo.
    echo Setup GitHub remote:
    echo git remote add origin https://github.com/boostfivem4-oss/fivem.git
    echo.
    pause
    goto menu
)
echo.
echo SUCCESS! Code pushed to GitHub
echo.
pause
goto menu

:vercel
echo.
echo ========================================
echo   Deploying to Vercel
echo ========================================
echo.
vercel --prod
if errorlevel 1 (
    echo.
    echo ERROR: Vercel CLI not found!
    echo Installing...
    npm install -g vercel
    echo.
    echo Run this script again
    pause
    goto menu
)
echo.
echo SUCCESS! Deployed to Vercel
echo.
pause
goto menu

:full
echo.
echo ========================================
echo   Full Deployment
echo ========================================
echo.
echo [1/2] Pushing to GitHub...
git add .
git commit -m "Deploy: FiveM Tools V7 - %date% %time%"
git push origin main
echo.
echo [2/2] Deploying to Vercel...
vercel --prod
echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
pause
goto menu

:end
echo.
echo Goodbye!
exit /b 0
