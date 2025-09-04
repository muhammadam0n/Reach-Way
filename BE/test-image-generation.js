#!/usr/bin/env node

/**
 * Test Image Generation
 * This script tests the image generation with your free API keys
 */

const axios = require('axios');
require('dotenv').config();

console.log('🎨 Testing Image Generation with Free Services...\n');

async function testImageGeneration() {
    try {
        console.log('🔍 Testing image generation...');
        
        const response = await axios.post('http://localhost:5000/api/ai/generate-image', {
            prompt: 'a beautiful sunset over mountains, digital art',
            width: 512,
            height: 512
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 seconds timeout
        });
        
        if (response.data && response.data.imageBase64) {
            console.log('✅ Image generation successful!');
            console.log('📊 Image data length:', response.data.imageBase64.length);
            console.log('🎯 Service used: Check server logs for details');
            
            // Save the image to a file for verification
            const fs = require('fs');
            const imageData = response.data.imageBase64.replace('data:image/png;base64,', '');
            fs.writeFileSync('test-generated-image.png', Buffer.from(imageData, 'base64'));
            console.log('💾 Image saved as: test-generated-image.png');
            
        } else {
            console.log('❌ No image data received');
        }
        
    } catch (error) {
        console.error('❌ Image generation failed:', error.response?.data || error.message);
        
        if (error.response?.data?.message) {
            console.log('📝 Error details:', error.response.data.message);
        }
    }
}

// Wait a moment for server to start
setTimeout(() => {
    testImageGeneration();
}, 3000);
