# 🆓 Free AI Image Generation Setup Guide

## Overview
This guide will help you set up completely free AI image generation services to replace the paid services that have billing limits.

## 🎯 Free Services Available

### 1. **Hugging Face (Primary Free Option)**
- **Cost**: Completely free
- **Limits**: 30,000 requests/month
- **Quality**: High quality Stable Diffusion models
- **Speed**: Fast

### 2. **Replicate (Secondary Free Option)**
- **Cost**: Completely free
- **Limits**: 500 predictions/month
- **Quality**: Excellent quality
- **Speed**: Medium (async)

### 3. **Google Gemini (Already Working)**
- **Cost**: Free tier available
- **Use**: For prompt generation (already working)

## 🚀 Quick Setup Steps

### Step 1: Get Hugging Face API Key (Recommended)

1. **Go to Hugging Face**: [https://huggingface.co/](https://huggingface.co/)
2. **Sign up/Login**: Create a free account
3. **Get API Key**:
   - Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Click "New token"
   - Name it "Media-Minds"
   - Select "Read" permissions
   - Copy the token

### Step 2: Get Replicate API Key (Backup)

1. **Go to Replicate**: [https://replicate.com/](https://replicate.com/)
2. **Sign up/Login**: Create a free account
3. **Get API Key**:
   - Go to [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
   - Click "Create API token"
   - Name it "Media-Minds"
   - Copy the token

### Step 3: Update Environment Variables

Add these to your `.env` file in the backend:

```env
# Free AI Services
HUGGINGFACE_API_KEY=hf_your_huggingface_token_here
REPLICATE_API_KEY=r8_your_replicate_token_here

# Keep existing keys as fallbacks
MODELSLAB_API_KEY=your_modelslab_key_here
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### Step 4: Test the Setup

Run the API checker to verify everything works:

```bash
cd Media-Minds/BE
node check-api-keys.js
```

## 🔧 How It Works Now

The system will now try services in this order:

1. **Hugging Face** (Free) - Primary
2. **Replicate** (Free) - Secondary
3. **OpenAI** (Paid) - Fallback
4. **ModelsLab** (Paid) - Fallback
5. **Placeholder** (Emergency) - Last resort

## 📊 Free Service Limits

| Service | Free Limit | Reset Period |
|---------|------------|--------------|
| Hugging Face | 30,000 requests | Monthly |
| Replicate | 500 predictions | Monthly |
| Gemini | 15 requests/minute | Per minute |

## 🎨 Image Quality Comparison

| Service | Quality | Speed | Cost |
|---------|---------|-------|------|
| Hugging Face | ⭐⭐⭐⭐ | Fast | Free |
| Replicate | ⭐⭐⭐⭐⭐ | Medium | Free |
| OpenAI | ⭐⭐⭐⭐⭐ | Fast | Paid |
| ModelsLab | ⭐⭐⭐⭐ | Fast | Paid |

## 🛠️ Troubleshooting

### If Hugging Face Fails:
- Check if you've exceeded the monthly limit
- Verify your API key is correct
- Try a simpler prompt

### If Replicate Fails:
- Check if you've exceeded the monthly limit
- Verify your API key is correct
- Wait a few minutes and try again

### If Both Free Services Fail:
- The system will automatically fall back to paid services
- Or use the placeholder image as emergency fallback

## 💡 Tips for Free Usage

1. **Optimize Prompts**: Use clear, specific prompts for better results
2. **Use Smaller Images**: 512x512 instead of 1024x1024 saves credits
3. **Cache Results**: Don't regenerate the same image multiple times
4. **Monitor Usage**: Check your usage in the service dashboards

## 🔄 Monthly Reset

- **Hugging Face**: Resets on the 1st of each month
- **Replicate**: Resets on the 1st of each month
- **Gemini**: Resets every minute

## 🆘 Emergency Fallback

If all services fail, the system will return a placeholder image instead of crashing. This ensures your application always works.

## 📱 Testing Your Setup

1. **Start your backend server**:
   ```bash
   cd Media-Minds/BE
   npm start
   ```

2. **Try generating an image** in your frontend

3. **Check the console logs** to see which service is being used

4. **Look for these messages**:
   - `[AI] Attempting Hugging Face generation...` ✅
   - `[AI] Hugging Face failed, attempting Replicate...` ⚠️
   - `[AI] All services failed, using placeholder...` ❌

## 🎉 Success!

Once set up, you'll have:
- ✅ Completely free AI image generation
- ✅ High-quality results
- ✅ Reliable fallback system
- ✅ No more billing limit errors

Your image generation should now work without any billing issues!
