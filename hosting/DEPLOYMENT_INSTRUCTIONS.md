# Reach-Way InfinityFree Hosting Deployment

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
```
public_html/
├── index.html
├── assets/
├── .htaccess
└── api.php
```

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
5. Set build command: `cd BE && npm install && npm start`
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
