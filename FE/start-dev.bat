@echo off
echo ========================================
echo   Facebook Integration Development
echo ========================================
echo.
echo This will start your development server and ngrok tunnel
echo for Facebook OAuth integration.
echo.
echo 1. Starting development server on http://localhost:3001
start "Dev Server" cmd /k "npm run dev"
echo.
echo 2. Starting ngrok tunnel for HTTPS...
start "ngrok" cmd /k "ngrok http 3001"
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Wait for ngrok to start and copy the HTTPS URL
echo 2. Update Facebook Developer Console with the ngrok URL
echo 3. Update socialConfig.js with the ngrok URL
echo 4. Access your app via the ngrok HTTPS URL
echo.
echo Example ngrok URL: https://abc123.ngrok.io
echo.
pause
