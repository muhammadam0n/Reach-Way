# AI Image Generation Billing Limit Solution Guide

## Problem
You're getting "Billing hard limit has been reached" error when generating images. This happens when your AI service API keys have reached their usage limits or billing quotas.

## Current Setup
Your application uses multiple AI services:
1. **ModelsLab** (Primary) - `MODELSLAB_API_KEY`
2. **OpenAI** (Fallback) - `OPENAI_API_KEY`
3. **Google Gemini** (Prompt generation) - `GEMINI_API_KEY`

## Solutions

### 1. Check Current API Key Status

First, verify which API keys are configured:
    
```bash
# Check your environment variables
echo $MODELSLAB_API_KEY
echo $OPENAI_API_KEY
echo $GEMINI_API_KEY
```

### 2. Update API Keys

#### For ModelsLab:
1. Go to [ModelsLab Dashboard](https://modelslab.com/dashboard)
2. Check your current usage and billing status
3. Add credits or upgrade your plan if needed
4. Generate a new API key if required

#### For OpenAI:
1. Go to [OpenAI Platform](https://platform.openai.com/account/billing)
2. Check your usage and billing status
3. Add payment method or credits
4. Generate a new API key if needed

#### For Google Gemini:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Check your quota usage
3. Enable billing if not already done
4. Generate a new API key if needed

### 3. Update Environment Variables

Update your environment variables with the new API keys:

```env
# Backend (.env file)
MODELSLAB_API_KEY=your_new_modelslab_api_key
OPENAI_API_KEY=your_new_openai_api_key
GEMINI_API_KEY=your_new_gemini_api_key

# Frontend (.env file)
VITE_GEMINI_API_KEY=your_new_gemini_api_key
```

### 4. Alternative Solutions

#### Option A: Use Free Tier Services
- **Hugging Face** - Free tier available
- **Replicate** - Free tier available
- **RunwayML** - Free tier available

#### Option B: Implement Local Generation
- Use **Stable Diffusion** locally
- Use **ComfyUI** for local generation
- Use **Automatic1111** WebUI

#### Option C: Add Multiple Fallback Services
The code already has fallback logic, but you can add more services:

```javascript
// Add more fallback services in aiController.js
const generateViaHuggingFace = async () => {
    // Implementation for Hugging Face
};

const generateViaReplicate = async () => {
    // Implementation for Replicate
};
```

### 5. Monitor Usage

Add usage monitoring to prevent future issues:

```javascript
// Add to your aiController.js
const trackUsage = (service, success) => {
    console.log(`[USAGE] ${service}: ${success ? 'SUCCESS' : 'FAILED'}`);
    // Add to database or monitoring service
};
```

### 6. Implement Rate Limiting

Add rate limiting to prevent excessive usage:

```javascript
const rateLimiter = {
    requests: 0,
    lastReset: Date.now(),
    maxRequests: 10, // per minute
    resetInterval: 60000 // 1 minute
};

const checkRateLimit = () => {
    const now = Date.now();
    if (now - rateLimiter.lastReset > rateLimiter.resetInterval) {
        rateLimiter.requests = 0;
        rateLimiter.lastReset = now;
    }
    
    if (rateLimiter.requests >= rateLimiter.maxRequests) {
        throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    rateLimiter.requests++;
};
```

### 7. Error Handling Improvements

The updated code now includes better error handling that will:
- Log which service is causing the billing error
- Provide specific error messages
- Attempt fallback to other services

### 8. Testing

After updating API keys, test the image generation:

1. Restart your backend server
2. Try generating a simple image
3. Check the console logs for detailed error information
4. Verify which service is working

### 9. Cost Optimization

To reduce costs:
- Use smaller image sizes (512x512 instead of 1024x1024)
- Implement caching for similar prompts
- Use lower quality settings where appropriate
- Set up usage alerts

### 10. Emergency Fallback

If all paid services are down, implement a basic fallback:

```javascript
const generatePlaceholderImage = async (prompt) => {
    // Generate a simple placeholder or use a default image
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
};
```

## Quick Fix Steps

1. **Immediate**: Check and update your API keys
2. **Short-term**: Add billing to your accounts
3. **Long-term**: Implement multiple fallback services
4. **Monitoring**: Add usage tracking and alerts

## Support

If you continue to have issues:
1. Check the server logs for specific error messages
2. Verify API key permissions and quotas
3. Test with a simple prompt first
4. Consider switching to a different AI service provider
