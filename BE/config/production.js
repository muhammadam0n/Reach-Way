module.exports = {
  NODE_ENV: 'production',
  PORT: process.env.PORT || 5000,
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'your_mongodb_production_uri_here',
  MYSQL_HOST: process.env.MYSQL_HOST || 'your_mysql_host_here',
  MYSQL_USER: process.env.MYSQL_USER || 'your_mysql_user_here',
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || 'your_mysql_password_here',
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'your_mysql_database_here',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloudinary_cloud_name',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'your_cloudinary_api_key',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'your_cloudinary_api_secret',
  
  // Social Media API Keys
  META_PAGE_ID: process.env.META_PAGE_ID || 'your_meta_page_id',
  META_LONG_LIVED_ACCESS_TOKEN: process.env.META_LONG_LIVED_ACCESS_TOKEN || 'your_meta_long_lived_access_token',
  INTA_BUS_ACC_ID: process.env.INTA_BUS_ACC_ID || 'your_instagram_business_account_id',
  
  // Google Gemini API
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'your_gemini_api_key_here',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://your-frontend-domain.com',
  
  // File Upload Configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10485760,
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads'
};
