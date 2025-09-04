#!/bin/bash

echo "🚀 Starting Reach-Way Project Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Create production directories
print_status "Creating production directories..."
mkdir -p production/backend
mkdir -p production/frontend

# Backend Deployment
print_status "Deploying Backend..."
cd BE

# Install production dependencies
print_status "Installing backend dependencies..."
npm ci --only=production

# Copy backend files to production
print_status "Copying backend files to production..."
cp -r * ../production/backend/
cp ../BE/config/production.js ../production/backend/config/
cp ../BE/server.production.js ../production/backend/server.js

# Create production package.json
cat > ../production/backend/package.json << EOF
{
  "name": "reach-way-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": $(cat package.json | jq '.dependencies'),
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

cd ..

# Frontend Deployment
print_status "Deploying Frontend..."
cd FE

# Install dependencies
print_status "Installing frontend dependencies..."
npm ci

# Build for production
print_status "Building frontend for production..."
npm run build

# Copy frontend build to production
print_status "Copying frontend build to production..."
cp -r dist/* ../production/frontend/

cd ..

# Create production environment file
print_status "Creating production environment file..."
cat > production/.env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=5000
SERVE_FRONTEND=true

# Database Configuration
MONGODB_URI=your_mongodb_production_uri_here
MYSQL_HOST=your_mysql_host_here
MYSQL_USER=your_mysql_user_here
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=your_mysql_database_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
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
CORS_ORIGIN=https://your-frontend-domain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
EOF

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem file..."
cat > production/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'reach-way-backend',
    script: './backend/server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_file: '../.env.production',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create Docker files
print_status "Creating Docker configuration..."
cat > production/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production
RUN cd frontend && npm ci

# Copy source code
COPY backend/ ./
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
EOF

cat > production/docker-compose.yml << EOF
version: '3.8'

services:
  media-minds:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - media-minds
    restart: unless-stopped
EOF

# Create nginx configuration
cat > production/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream media_minds_backend {
        server media-minds:5000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            root /app/frontend;
            try_files \$uri \$uri/ /index.html;
        }

        location /api {
            proxy_pass http://media_minds_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        location /uploads {
            proxy_pass http://media_minds_backend;
        }
    }
}
EOF

# Create deployment instructions
print_status "Creating deployment instructions..."
cat > production/DEPLOYMENT_INSTRUCTIONS.md << EOF
# Reach-Way Production Deployment Guide

## Prerequisites
- Node.js 16+ installed
- npm 8+ installed
- PM2 installed globally: \`npm install -g pm2\`
- Docker and Docker Compose (optional)

## Environment Setup
1. Edit \`.env.production\` file with your production values
2. Update database URIs, API keys, and domain names
3. Set proper JWT secrets and CORS origins

## Deployment Options

### Option 1: PM2 Deployment (Recommended)
\`\`\`bash
cd production/backend
npm install
pm2 start ecosystem.config.js
pm2 save
pm2 startup
\`\`\`

### Option 2: Docker Deployment
\`\`\`bash
cd production
docker-compose up -d --build
\`\`\`

### Option 3: Manual Deployment
\`\`\`bash
cd production/backend
npm install
npm start
\`\`\`

## Health Check
- Backend: http://localhost:5000/health
- Frontend: http://localhost:5000 (if SERVE_FRONTEND=true)

## Monitoring
- PM2: \`pm2 monit\`
- Logs: \`pm2 logs\`

## SSL Setup
1. Place SSL certificates in \`./ssl\` directory
2. Update nginx.conf with your domain
3. Restart nginx service

## Database Setup
1. Create production MongoDB/MySQL instances
2. Update connection strings in .env.production
3. Run database migrations if needed

## File Uploads
- Uploads directory: \`./uploads\`
- Ensure proper permissions: \`chmod 755 uploads\`

## Security Checklist
- [ ] JWT secrets are strong and unique
- [ ] CORS origins are restricted to production domains
- [ ] API keys are properly secured
- [ ] Database connections use SSL
- [ ] File upload limits are enforced
- [ ] Error messages don't expose sensitive information
EOF

# Create startup script
cat > production/start.sh << EOF
#!/bin/bash
echo "🚀 Starting Reach-Way Production Server..."

# Load environment variables
export \$(cat .env.production | xargs)

# Create necessary directories
mkdir -p logs uploads

# Set permissions
chmod 755 uploads

# Start the application
cd backend
npm start
EOF

chmod +x production/start.sh

print_status "Deployment package created successfully!"
print_status "Production files are in the 'production' directory"
print_warning "Please update the .env.production file with your production values"
print_status "Run 'cd production && ./start.sh' to start the production server"

echo ""
echo "📁 Production directory structure:"
echo "production/"
echo "├── backend/          # Backend application files"
echo "├── frontend/         # Frontend build files"
echo "├── .env.production   # Environment configuration"
echo "├── ecosystem.config.js # PM2 configuration"
echo "├── Dockerfile        # Docker configuration"
echo "├── docker-compose.yml # Docker Compose setup"
echo "├── nginx.conf        # Nginx configuration"
echo "├── start.sh          # Startup script"
echo "└── DEPLOYMENT_INSTRUCTIONS.md # Deployment guide"

echo ""
print_status "Deployment package ready! 🎉"
