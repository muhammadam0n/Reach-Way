@echo off
echo 🚀 Starting Reach-Way Project Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] Node.js version: 
node --version
echo [INFO] npm version: 
npm --version

REM Create production directories
echo [INFO] Creating production directories...
if not exist "production" mkdir production
if not exist "production\backend" mkdir production\backend
if not exist "production\frontend" mkdir production\frontend

REM Backend Deployment
echo [INFO] Deploying Backend...
cd BE

REM Install production dependencies
echo [INFO] Installing backend dependencies...
call npm ci --only=production

REM Copy backend files to production
echo [INFO] Copying backend files to production...
xcopy /E /I /Y * ..\production\backend\
copy config\production.js ..\production\backend\config\
copy server.production.js ..\production\backend\server.js

cd ..

REM Frontend Deployment
echo [INFO] Deploying Frontend...
cd FE

REM Install dependencies
echo [INFO] Installing frontend dependencies...
call npm ci

REM Build for production
echo [INFO] Building frontend for production...
call npm run build

REM Copy frontend build to production
echo [INFO] Copying frontend build to production...
xcopy /E /I /Y dist\* ..\production\frontend\

cd ..

REM Create production environment file
echo [INFO] Creating production environment file...
(
echo # Production Environment Variables
echo NODE_ENV=production
echo PORT=5000
echo SERVE_FRONTEND=true
echo.
echo # Database Configuration
echo MONGODB_URI=your_mongodb_production_uri_here
echo MYSQL_HOST=your_mysql_host_here
echo MYSQL_USER=your_mysql_user_here
echo MYSQL_PASSWORD=your_mysql_password_here
echo MYSQL_DATABASE=your_mysql_database_here
echo.
echo # JWT Configuration
echo JWT_SECRET=your_jwt_secret_here
echo JWT_EXPIRES_IN=7d
echo.
echo # Cloudinary Configuration
echo CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
echo CLOUDINARY_API_KEY=your_cloudinary_api_key
echo CLOUDINARY_API_SECRET=your_cloudinary_api_secret
echo.
echo # Social Media API Keys
echo META_PAGE_ID=your_meta_page_id
echo META_LONG_LIVED_ACCESS_TOKEN=your_meta_long_lived_access_token
echo INTA_BUS_ACC_ID=your_instagram_business_account_id
echo.
echo # Google Gemini API
echo GEMINI_API_KEY=your_gemini_api_key_here
echo.
echo # CORS Configuration
echo CORS_ORIGIN=https://your-frontend-domain.com
echo.
echo # File Upload Configuration
echo MAX_FILE_SIZE=10485760
echo UPLOAD_PATH=./uploads
) > production\.env.production

REM Create PM2 ecosystem file
echo [INFO] Creating PM2 ecosystem file...
(
echo module.exports = {
echo   apps: [{
echo     name: 'reach-way-backend',
echo     script: './backend/server.js',
echo     cwd: './backend',
echo     instances: 'max',
echo     exec_mode: 'cluster',
echo     env: {
echo       NODE_ENV: 'production',
echo       PORT: 5000
echo     },
echo     env_file: '../.env.production',
echo     error_file: './logs/err.log',
echo     out_file: './logs/out.log',
echo     log_file: './logs/combined.log',
echo     time: true,
echo     max_memory_restart: '1G',
echo     node_args: '--max-old-space-size=1024'
echo   }]
echo };
) > production\ecosystem.config.js

REM Create startup script
echo [INFO] Creating startup script...
(
echo @echo off
echo 🚀 Starting Reach-Way Production Server...
echo.
echo REM Load environment variables
echo for /f "tokens=*" %%a in ^(.env.production^) do ^
echo   set %%a
echo.
echo REM Create necessary directories
echo if not exist "logs" mkdir logs
echo if not exist "uploads" mkdir uploads
echo.
echo REM Set permissions
echo icacls uploads /grant Everyone:F
echo.
echo REM Start the application
echo cd backend
echo npm start
echo pause
) > production\start.bat

REM Create deployment instructions
echo [INFO] Creating deployment instructions...
(
echo # Reach-Way Production Deployment Guide
echo.
echo ## Prerequisites
echo - Node.js 16+ installed
echo - npm 8+ installed
echo - PM2 installed globally: `npm install -g pm2`
echo.
echo ## Environment Setup
echo 1. Edit `.env.production` file with your production values
echo 2. Update database URIs, API keys, and domain names
echo 3. Set proper JWT secrets and CORS origins
echo.
echo ## Deployment Options
echo.
echo ### Option 1: PM2 Deployment ^(Recommended^)
echo ```bash
echo cd production/backend
echo npm install
echo pm2 start ecosystem.config.js
echo pm2 save
echo pm2 startup
echo ```
echo.
echo ### Option 2: Manual Deployment
echo ```bash
echo cd production/backend
echo npm install
echo npm start
echo ```
echo.
echo ## Health Check
echo - Backend: http://localhost:5000/health
echo - Frontend: http://localhost:5000 ^(if SERVE_FRONTEND=true^)
echo.
echo ## Monitoring
echo - PM2: `pm2 monit`
echo - Logs: `pm2 logs`
echo.
echo ## Security Checklist
echo - [ ] JWT secrets are strong and unique
echo - [ ] CORS origins are restricted to production domains
echo - [ ] API keys are properly secured
echo - [ ] Database connections use SSL
echo - [ ] File upload limits are enforced
echo - [ ] Error messages don't expose sensitive information
) > production\DEPLOYMENT_INSTRUCTIONS.md

echo [INFO] Deployment package created successfully!
echo [INFO] Production files are in the 'production' directory
echo [WARNING] Please update the .env.production file with your production values
echo [INFO] Run 'cd production && start.bat' to start the production server

echo.
echo 📁 Production directory structure:
echo production/
echo ├── backend/          # Backend application files
echo ├── frontend/         # Frontend build files
echo ├── .env.production   # Environment configuration
echo ├── ecosystem.config.js # PM2 configuration
echo ├── start.bat         # Startup script
echo └── DEPLOYMENT_INSTRUCTIONS.md # Deployment guide

echo.
echo [INFO] Deployment package ready! 🎉
pause
