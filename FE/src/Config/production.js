export const PRODUCTION_CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.VITE_API_BASE_URL || 'https://your-backend-domain.com',
  
  // Google Gemini API
  GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || 'your_gemini_api_key_here',
  
  // App Configuration
  APP_NAME: 'Reach-Way',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_MULTI_PLATFORM: true,
  ENABLE_AI_FEATURES: true,
  
  // Upload Configuration
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // Social Media Platforms
  SUPPORTED_PLATFORMS: ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok'],
  
  // Analytics Configuration
  ANALYTICS_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Error Reporting
  ENABLE_ERROR_REPORTING: true,
  LOG_LEVEL: 'error'
};
