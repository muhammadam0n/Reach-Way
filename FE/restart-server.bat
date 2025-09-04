@echo off
echo ========================================
echo   Facebook Integration Fix - Restart
echo ========================================
echo.
echo Stopping any running development servers...
taskkill /f /im node.exe 2>nul
echo.
echo Starting development server with HTTPS...
echo Your app will be available at: https://localhost:3001
echo.
echo Note: You may see a security warning in your browser.
echo Click "Advanced" and "Proceed to localhost (unsafe)" to continue.
echo.
npm run dev
pause
