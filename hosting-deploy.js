const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparing Reach-Way for InfinityFree Hosting...');

// Create hosting directory
const hostingDir = path.join(__dirname, 'hosting');
if (fs.existsSync(hostingDir)) {
    fs.rmSync(hostingDir, { recursive: true, force: true });
}
fs.mkdirSync(hostingDir);

// Build frontend
console.log('📦 Building frontend...');
try {
    execSync('npm run build', { cwd: path.join(__dirname, 'FE'), stdio: 'inherit' });
    console.log('✅ Frontend built successfully');
} catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    process.exit(1);
}

// Copy frontend build to hosting directory
const frontendBuildDir = path.join(__dirname, 'FE', 'dist');
const hostingFrontendDir = path.join(hostingDir, 'public_html');
fs.mkdirSync(hostingFrontendDir, { recursive: true });

// Copy frontend files
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

copyDir(frontendBuildDir, hostingFrontendDir);
console.log('✅ Frontend files copied to hosting directory');

// Create .htaccess for SPA routing
const htaccessContent = `RewriteEngine On
RewriteBase /

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache static assets
<FilesMatch "\\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>`;

fs.writeFileSync(path.join(hostingFrontendDir, '.htaccess'), htaccessContent);
console.log('✅ .htaccess file created');

// Create API proxy file for backend calls
const apiProxyContent = `<?php
// API Proxy for Reach-Way Backend
// This file handles API requests and forwards them to your backend

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Your backend URL (you'll need to deploy the backend separately)
$backendUrl = 'https://your-backend-url.com';

$requestUri = $_SERVER['REQUEST_URI'];
$apiPath = str_replace('/api/', '', $requestUri);

$url = $backendUrl . '/api/' . $apiPath;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: ' . ($_SERVER['HTTP_AUTHORIZATION'] ?? '')
]);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
?>`;

fs.writeFileSync(path.join(hostingFrontendDir, 'api.php'), apiProxyContent);
console.log('✅ API proxy file created');

// Create environment configuration file
const envConfig = `# Reach-Way Environment Configuration
# Copy this to your backend hosting platform as environment variables

# Database Configuration
MONGODB_URI=mongodb+srv://amanmuhammad7c:bF8ubV9Yre2IaijS@cluster0.tp7i8kp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Cloudinary Configuration (add your own)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Social Media API Keys (add your own)
META_PAGE_ID=your_meta_page_id
META_LONG_LIVED_ACCESS_TOKEN=your_meta_long_lived_access_token
INTA_BUS_ACC_ID=your_instagram_business_account_id

# Google Gemini API (add your own)
GEMINI_API_KEY=your_gemini_api_key_here

# TikTok API Configuration
TIKTOK_CLIENT_KEY=awxtg5un0z1i88hu
TIKTOK_CLIENT_SECRET=bIojJxNU8oOYm6ETtnyNPqZXHyixQ7HX
TIKTOK_REDIRECT_URI=https://your-frontend-domain.com/auth/tiktok/callback

# Reddit API Configuration (add your own)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_REDIRECT_URI=https://your-frontend-domain.com/auth/reddit/callback

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads`;

fs.writeFileSync(path.join(hostingDir, 'environment-variables.txt'), envConfig);
console.log('✅ Environment configuration file created');

// Create deployment instructions
const deploymentInstructions = `# Reach-Way InfinityFree Hosting Deployment

## 🎯 Quick Start

1. **Upload Frontend Files:**
   - Upload all files from the 'public_html' folder to your InfinityFree hosting's public_html directory
   - This includes: index.html, assets folder, .htaccess, and api.php

2. **Deploy Backend (Choose one):**
   - **Railway:** https://railway.app (Recommended - Free tier available)
   - **Render:** https://render.com (Free tier available)
   - **Heroku:** https://heroku.com (Free tier available)
   - **Vercel:** https://vercel.com (Free tier available)

3. **Configure Environment Variables:**
   - Copy the contents of 'environment-variables.txt' to your backend hosting platform
   - Update the values with your actual API keys and secrets

4. **Update API Proxy:**
   - Edit 'api.php' in your hosting and update $backendUrl with your backend URL

## 📁 File Structure
\`\`\`
public_html/
├── index.html
├── assets/
├── .htaccess
└── api.php
\`\`\`

## 🔧 Backend Deployment Steps:

### Option 1: Railway (Recommended)
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Connect your GitHub repository
5. Add environment variables from 'environment-variables.txt'
6. Deploy

### Option 2: Render
1. Go to https://render.com
2. Sign up with GitHub
3. Create new Web Service
4. Connect your repository
5. Set build command: \`cd BE && npm install && npm start\`
6. Add environment variables
7. Deploy

## 🌐 Your Database
Your MongoDB database is already configured:
- **Connection String:** mongodb+srv://amanmuhammad7c:bF8ubV9Yre2IaijS@cluster0.tp7i8kp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
- **Database:** Cluster0

## 📋 Required API Keys:
1. **Cloudinary** (for image uploads)
2. **Facebook/Meta** (for social media posting)
3. **Google Gemini** (for AI image analysis)
4. **Instagram Business** (for Instagram posting)

## 🚀 Next Steps:
1. Deploy your backend to a Node.js hosting platform
2. Update api.php with your backend URL
3. Upload frontend files to InfinityFree
4. Test your application

## 📞 Support:
If you need help with backend deployment, let me know!

## 🔗 Useful Links:
- **InfinityFree Control Panel:** https://app.infinityfree.net
- **Railway:** https://railway.app
- **Render:** https://render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
`;

fs.writeFileSync(path.join(hostingDir, 'DEPLOYMENT_INSTRUCTIONS.md'), deploymentInstructions);
console.log('✅ Deployment instructions created');

// Create a zip file for easy upload
console.log('📦 Creating deployment package...');
try {
    execSync(`powershell Compress-Archive -Path "${hostingFrontendDir}\\*" -DestinationPath "${hostingDir}\\reach-way-frontend.zip" -Force`, { stdio: 'inherit' });
    console.log('✅ Deployment package created: hosting/reach-way-frontend.zip');
} catch (error) {
    console.log('⚠️  Could not create zip file. You can manually zip the public_html folder.');
}

console.log('\n🎉 Deployment package ready!');
console.log('📁 Check the "hosting" folder for your deployment files');
console.log('📖 Read DEPLOYMENT_INSTRUCTIONS.md for next steps');
console.log('🗄️  Your MongoDB database is configured and ready!');

