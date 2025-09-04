#!/usr/bin/env node

/**
 * Test New API Key
 * This script tests the new API key that can detect images and provide captions
 */

const axios = require('axios');
require('dotenv').config();

console.log('🔍 Testing New API Key...\n');

const NEW_API_KEY = 'sk-Vvav7s4JAQ3XSjhzuzo0B8UbG6CSJOQeXYatc0VmNEGj2wj3';

async function testNewAPI() {
    console.log('🧪 Testing new API key for image analysis...');
    
    try {
        // Test if this is an OpenAI-compatible API
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${NEW_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ API key is valid!');
        console.log('📋 Available models:', response.data.data?.map(m => m.id).join(', '));
        
        // Test image generation capability
        const imageResponse = await axios.post('https://api.openai.com/v1/images/generations', {
            model: "dall-e-3",
            prompt: "a playful tabby kitten, leaping mid-air to snatch a dangling toy mouse",
            size: "1024x1024",
            quality: "standard",
            n: 1
        }, {
            headers: {
                'Authorization': `Bearer ${NEW_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('✅ Image generation successful!');
        console.log('🎨 Generated image URL:', imageResponse.data.data[0].url);
        
        return true;
        
    } catch (error) {
        console.error('❌ API test failed:', error.response?.data || error.message);
        
        // Try alternative endpoints
        console.log('\n🔄 Trying alternative endpoints...');
        
        try {
            // Test if it's a different API service
            const altResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4",
                messages: [
                    {
                        role: "user",
                        content: "Hello, can you help me with image generation?"
                    }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${NEW_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            console.log('✅ Chat completion successful!');
            console.log('💬 Response:', altResponse.data.choices[0].message.content);
            
        } catch (altError) {
            console.error('❌ Alternative test also failed:', altError.response?.data || altError.message);
        }
        
        return false;
    }
}

async function main() {
    console.log('🔑 Testing API Key:', NEW_API_KEY.substring(0, 10) + '...');
    console.log('');
    
    const success = await testNewAPI();
    
    console.log('\n📝 Summary:');
    if (success) {
        console.log('✅ New API key is working for image generation!');
        console.log('🚀 You can now use this for generating images instead of blue placeholders.');
    } else {
        console.log('❌ New API key needs different integration approach.');
        console.log('🔧 This might be a specialized image analysis API, not image generation.');
    }
}

main().catch(console.error);
