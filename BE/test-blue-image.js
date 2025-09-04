#!/usr/bin/env node

/**
 * Test Blue Image Issue
 * This script tests the image generation endpoint to see why it's returning blue placeholders
 */

const axios = require('axios');
require('dotenv').config();

console.log('🔍 Testing Blue Image Issue...\n');

async function testImageGeneration() {
    console.log('🧪 Testing image generation endpoint...');
    
    try {
        const response = await axios.post('http://localhost:5000/api/ai/generate-image', {
            prompt: 'a playful tabby kitten, leaping mid-air to snatch a dangling toy mouse, captured with a fast shutter speed and a wide-angle lens, resulting in a dynamic, action-packed image bursting with vibrant colors and a slightly blurred background, reminiscent of a National Geographic photo',
            width: 512,
            height: 512
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });
        
        if (response.data && response.data.imageBase64) {
            console.log('✅ Image generated successfully!');
            console.log('📊 Image data length:', response.data.imageBase64.length);
            
            // Check if it's a placeholder
            if (response.data.imageBase64.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')) {
                console.log('❌ This is a blue placeholder image!');
                console.log('🔍 This means all AI services failed and the system fell back to placeholder.');
            } else {
                console.log('✅ This appears to be a real generated image!');
            }
            
            // Save the image
            const fs = require('fs');
            const imageData = response.data.imageBase64.replace('data:image/png;base64,', '');
            fs.writeFileSync('test-generated-image.png', Buffer.from(imageData, 'base64'));
            console.log('💾 Image saved as: test-generated-image.png');
            
        } else {
            console.log('❌ No image data from server');
        }
        
    } catch (error) {
        console.error('❌ Server endpoint error:', error.response?.data || error.message);
    }
}

async function checkAPIKeys() {
    console.log('🔑 Checking API Keys:');
    console.log('OpenAI:', process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing');
    console.log('ModelsLab:', process.env.MODELSLAB_API_KEY ? '✅ Present' : '❌ Missing');
    console.log('Stability:', process.env.STABILITY_API_KEY ? '✅ Present' : '❌ Missing');
    console.log('');
}

async function main() {
    await checkAPIKeys();
    await testImageGeneration();
    
    console.log('\n📝 Summary:');
    console.log('If you got a blue placeholder, it means:');
    console.log('1. OpenAI needs billing setup');
    console.log('2. ModelsLab needs billing setup');
    console.log('3. Stability AI key is missing');
    console.log('4. All services failed and system used placeholder');
    console.log('\n🔧 Solution: Add billing to OpenAI or ModelsLab, or get Stability AI key');
}

main().catch(console.error);
