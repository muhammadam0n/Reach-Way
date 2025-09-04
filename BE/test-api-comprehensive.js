#!/usr/bin/env node

/**
 * Comprehensive API Test
 * This script tests the API key against various possible endpoints
 */

const axios = require('axios');
require('dotenv').config();

console.log('🔍 Comprehensive API Key Test...\n');

const API_KEY = 'sk-Vvav7s4JAQ3XSjhzuzo0B8UbG6CSJOQeXYatc0VmNEGj2wj3';

async function testOpenAI() {
    console.log('🧪 Testing OpenAI endpoints...');
    try {
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        console.log('✅ OpenAI API working!');
        return true;
    } catch (error) {
        console.log('❌ Not OpenAI API');
        return false;
    }
}

async function testAnthropic() {
    console.log('🧪 Testing Anthropic Claude...');
    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-3-sonnet-20240229',
            max_tokens: 100,
            messages: [{ role: 'user', content: 'Hello' }]
        }, {
            headers: { 
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01'
            }
        });
        console.log('✅ Anthropic API working!');
        return true;
    } catch (error) {
        console.log('❌ Not Anthropic API');
        return false;
    }
}

async function testGoogleAI() {
    console.log('🧪 Testing Google AI...');
    try {
        const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            contents: [{ parts: [{ text: 'Hello' }] }]
        }, {
            params: { key: API_KEY }
        });
        console.log('✅ Google AI API working!');
        return true;
    } catch (error) {
        console.log('❌ Not Google AI API');
        return false;
    }
}

async function testHuggingFace() {
    console.log('🧪 Testing Hugging Face...');
    try {
        const response = await axios.post('https://api-inference.huggingface.co/models/gpt2', {
            inputs: 'Hello world'
        }, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        console.log('✅ Hugging Face API working!');
        return true;
    } catch (error) {
        console.log('❌ Not Hugging Face API');
        return false;
    }
}

async function testCustomEndpoint() {
    console.log('🧪 Testing custom endpoints...');
    
    const endpoints = [
        'https://api.deepai.org/api/text2img',
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        'https://api.replicate.com/v1/models',
        'https://api.modelscope.cn/api/v1/models'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(endpoint, {
                headers: { 'Authorization': `Bearer ${API_KEY}` },
                timeout: 5000
            });
            console.log(`✅ Working with: ${endpoint}`);
            return endpoint;
        } catch (error) {
            console.log(`❌ Not working with: ${endpoint}`);
        }
    }
    return null;
}

async function main() {
    console.log('🔑 Testing API Key:', API_KEY.substring(0, 10) + '...');
    console.log('');
    
    const results = await Promise.all([
        testOpenAI(),
        testAnthropic(),
        testGoogleAI(),
        testHuggingFace()
    ]);
    
    const customEndpoint = await testCustomEndpoint();
    
    console.log('\n📝 Summary:');
    if (results.some(r => r)) {
        console.log('✅ API key is working with one of the tested services!');
    } else if (customEndpoint) {
        console.log(`✅ API key is working with custom endpoint: ${customEndpoint}`);
    } else {
        console.log('❌ API key not recognized with any tested service.');
        console.log('🔧 This might be a specialized or custom API service.');
        console.log('💡 Please provide more information about the API service.');
    }
}

main().catch(console.error);
