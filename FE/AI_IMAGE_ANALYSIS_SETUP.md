# AI Image Analysis Setup Guide

## Overview
The content library now includes AI-powered automatic image description generation. When you upload an image, the AI will automatically analyze it and generate an engaging description suitable for social media.

## Setup Instructions

### 1. Get Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables
Create a `.env` file in the `FE` directory with:

```env
VITE_API_KEY=your_google_gemini_api_key_here
```

Replace `your_google_gemini_api_key_here` with your actual API key.

### 3. Restart Development Server
After adding the environment variable, restart your development server:

```bash
npm run dev
```

## Features

### Automatic Analysis
- Images are automatically analyzed when uploaded
- AI generates engaging social media descriptions
- Descriptions are optimized for engagement

### Manual Analysis
- Click "Analyze Image" button to re-analyze images
- Useful for getting different descriptions or analyzing existing images

### User Control
- Edit AI-generated descriptions as needed
- Clear descriptions to start fresh
- Combine AI suggestions with your own content

## How It Works

1. **Upload Image**: Drag and drop or select an image file
2. **AI Analysis**: The system automatically sends the image to Google's Gemini AI
3. **Description Generation**: AI analyzes the image content and generates a description
4. **User Review**: Review and edit the generated description
5. **Post Creation**: Use the description for your social media posts

## Supported Image Formats
- JPEG/JPG
- PNG
- GIF
- WebP
- Other common image formats

## Troubleshooting

### API Key Issues
- Ensure your API key is correctly set in the `.env` file
- Verify the API key has proper permissions
- Check that the environment variable name is exactly `VITE_API_KEY`

### Image Analysis Failures
- Ensure the image file is not corrupted
- Check that the image format is supported
- Verify your internet connection
- Try uploading a different image

### Performance
- Large images may take longer to analyze
- The system automatically handles image optimization
- Analysis typically takes 2-5 seconds

## Security Notes
- Images are sent to Google's AI service for analysis
- No images are permanently stored by Google
- API keys should be kept secure and not shared publicly
- Consider rate limits for your API usage

## Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key configuration
3. Ensure you have proper internet connectivity
4. Try with different image files
