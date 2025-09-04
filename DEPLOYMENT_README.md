# 🚀 Reach-Way Project Deployment Guide

This guide will help you deploy the Reach-Way project to production. The project consists of a React frontend and Node.js backend with comprehensive social media management features.

## 📋 Prerequisites

Before deploying, ensure you have:

- **Node.js 16+** installed
- **npm 8+** installed
- **Git** for version control
- **PM2** for process management (optional but recommended)
- **Docker & Docker Compose** (optional, for containerized deployment)

## 🏗️ Project Structure

```
Reach-Way/
├── FE/                     # Frontend (React + Vite)
├── BE/                     # Backend (Node.js + Express)
├── deploy.sh              # Linux/Mac deployment script
├── deploy.bat             # Windows deployment script
└── production/            # Production build (created after deployment)
```

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

#### For Linux/Mac:
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

#### For Windows:
```cmd
# Run deployment script
deploy.bat
```

### Option 2: Manual Deployment

#### Step 1: Backend Setup
```bash
cd Reach-Way/BE

# Install dependencies
npm install

# Create production config
cp config/production.js config/
cp server.production.js server.js

# Start production server
npm start
```

#### Step 2: Frontend Setup
```bash
cd Reach-Way/FE

# Install dependencies
npm install

# Build for production
npm run build

# The built files will be in the 'dist' folder
```

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env.production` file in the production directory:

```env
# Production Environment Variables
NODE_ENV=production
PORT=5000
SERVE_FRONTEND=true

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MYSQL_HOST=your-mysql-host.com
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_mysql_database

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Social Media API Keys
META_PAGE_ID=your_meta_page_id
META_LONG_LIVED_ACCESS_TOKEN=your_meta_long_lived_access_token
INTA_BUS_ACC_ID=your_instagram_business_account_id

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend Environment Variables

Create a `.env.production` file in the FE directory:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🌐 Deployment Options

### 1. PM2 Deployment (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Navigate to production directory
cd production/backend

# Install dependencies
npm install

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### 2. Docker Deployment

```bash
cd production

# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### 3. Manual Deployment

```bash
cd production/backend

# Install dependencies
npm install

# Start server
npm start
```

## 🔧 Production Server Configuration

### Nginx Configuration (Optional)

If using Nginx as a reverse proxy, update the `nginx.conf` file with your domain:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /app/frontend;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://media-minds-backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL/HTTPS Setup

1. Obtain SSL certificates (Let's Encrypt, etc.)
2. Place certificates in `./ssl` directory
3. Update nginx configuration for HTTPS
4. Redirect HTTP to HTTPS

## 📊 Monitoring & Maintenance

### Health Checks

- **Backend Health**: `http://your-domain.com/health`
- **Frontend**: `http://your-domain.com`

### PM2 Commands

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart media-minds-backend

# Stop application
pm2 stop media-minds-backend

# Delete application
pm2 delete media-minds-backend
```

### Log Management

Logs are stored in the `logs/` directory:
- `err.log` - Error logs
- `out.log` - Output logs
- `combined.log` - Combined logs

## 🔒 Security Checklist

- [ ] **JWT Secrets**: Use strong, unique secrets
- [ ] **CORS**: Restrict origins to production domains
- [ ] **API Keys**: Secure all external API keys
- [ ] **Database**: Use SSL connections
- [ ] **File Uploads**: Enforce size and type limits
- [ ] **Error Messages**: Don't expose sensitive information
- [ ] **Environment Variables**: Never commit to version control
- [ ] **Dependencies**: Keep updated and audit regularly

## 🗄️ Database Setup

### MongoDB (Recommended)

1. Create MongoDB Atlas cluster or self-hosted instance
2. Create database user with appropriate permissions
3. Update `MONGODB_URI` in environment variables
4. Test connection

### MySQL (Alternative)

1. Create MySQL database and user
2. Grant necessary permissions
3. Update MySQL environment variables
4. Test connection

## 📁 File Uploads

- **Upload Directory**: `./uploads`
- **Permissions**: Ensure write access for the application
- **Backup**: Regularly backup uploaded files
- **Cleanup**: Implement file cleanup policies

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :5000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Permission Denied**
   ```bash
   # Fix uploads directory permissions
   chmod 755 uploads
   chown -R node:node uploads
   ```

3. **Database Connection Failed**
   - Check connection strings
   - Verify network access
   - Check firewall settings

4. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Log Analysis

```bash
# View real-time logs
tail -f logs/combined.log

# Search for errors
grep "ERROR" logs/combined.log

# Search for specific API calls
grep "POST /api" logs/combined.log
```

## 📈 Performance Optimization

### Backend

- **PM2 Clustering**: Multiple instances for load balancing
- **Memory Management**: Monitor and optimize memory usage
- **Database Indexing**: Optimize database queries
- **Caching**: Implement Redis for session/data caching

### Frontend

- **Code Splitting**: Lazy load components
- **Image Optimization**: Compress and optimize images
- **CDN**: Use CDN for static assets
- **Bundle Analysis**: Monitor bundle sizes

## 🔄 Updates & Maintenance

### Regular Maintenance

1. **Security Updates**: Keep dependencies updated
2. **Backup**: Regular database and file backups
3. **Monitoring**: Monitor server resources and logs
4. **Performance**: Regular performance audits

### Deployment Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
./deploy.sh

# Restart PM2 processes
pm2 restart media-minds-backend
```

## 📞 Support

If you encounter issues during deployment:

1. Check the logs in the `logs/` directory
2. Verify environment variables are set correctly
3. Ensure all prerequisites are met
4. Check the troubleshooting section above

## 🎯 Next Steps

After successful deployment:

1. **Test all features** thoroughly
2. **Set up monitoring** and alerting
3. **Configure backups** and disaster recovery
4. **Document** your production setup
5. **Train team** on maintenance procedures

---

**Happy Deploying! 🚀**

Your Reach-Way project is now ready for production use with comprehensive social media management capabilities.
