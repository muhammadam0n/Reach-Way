#!/usr/bin/env node

/**
 * API Key Status Checker
 * This script helps identify which AI service is causing billing limit errors
 */

const axios = require('axios');
require('dotenv').config();

console.log('🔍 Checking AI Service API Keys...\n');

// Check environment variables
const apiKeys = {
    huggingface: process.env.HUGGINGFACE_API_KEY,
    replicate: process.env.REPLICATE_API_KEY,
    modelslab: process.env.MODELSLAB_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    gemini: process.env.GEMINI_API_KEY
};

console.log('📋 API Key Status:');
Object.entries(apiKeys).forEach(([service, key]) => {
    const status = key ? '✅ Present' : '❌ Missing';
    const preview = key ? `${key.substring(0, 8)}...` : 'Not configured';
    console.log(`  ${service.toUpperCase()}: ${status} (${preview})`);
});

console.log('\n🧪 Testing API Connections...\n');

// Test Hugging Face
async function testHuggingFace() {
    if (!apiKeys.huggingface) {
        console.log('❌ Hugging Face: No API key configured');
        return;
    }
    
    try {
        console.log('🔍 Testing Hugging Face...');
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
            {
                inputs: 'test image',
                parameters: {
                    width: 64,
                    height: 64,
                    num_inference_steps: 1
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKeys.huggingface}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer',
                timeout: 15000
            }
        );
        
        if (response.status === 200) {
            console.log('✅ Hugging Face: API key valid and working');
        } else {
            console.log('⚠️  Hugging Face: Unexpected response');
        }
    } catch (error) {
        if (error.response?.status === 429) {
            console.log('⚠️  Hugging Face: Rate limit exceeded (normal for free tier)');
        } else if (error.response?.status === 503) {
            console.log('⚠️  Hugging Face: Model loading (normal for free tier)');
        } else {
            console.log('❌ Hugging Face: Connection failed -', error.message);
        }
    }
}

// Test Replicate
async function testReplicate() {
    if (!apiKeys.replicate) {
        console.log('❌ Replicate: No API key configured');
        return;
    }
    
    try {
        console.log('🔍 Testing Replicate...');
        const response = await axios.get(
            'https://api.replicate.com/v1/models',
            {
                headers: {
                    'Authorization': `Token ${apiKeys.replicate}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        console.log('✅ Replicate: API key valid and working');
    } catch (error) {
        if (error.response?.data?.error) {
            console.log('❌ Replicate: API Error -', error.response.data.error);
        } else {
            console.log('❌ Replicate: Connection failed -', error.message);
        }
    }
}

// Test ModelsLab
async function testModelsLab() {
    if (!apiKeys.modelslab) {
        console.log('❌ ModelsLab: No API key configured');
        return;
    }
    
    try {
        console.log('🔍 Testing ModelsLab...');
        const response = await axios.post(
            'https://modelslab.com/api/v6/images/text2img',
            {
                key: apiKeys.modelslab,
                model_id: 'realistic-vision-v51',
                prompt: 'test',
                width: 512,
                height: 512,
                samples: 1,
                num_inference_steps: 1, // Minimal steps for testing
                guidance_scale: 7.5,
                safety_checker: 'no',
                enhance_prompt: 'no',
                seed: 123,
                multi_lingual: 'no',
                panorama: 'no',
                self_attention: 'no',
                upscale: 'no',
                tomesd: 'yes',
                clip_skip: 2,
                use_karras_sigmas: 'yes',
                scheduler: 'UniPCMultistepScheduler',
            },
            { 
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000 // 10 second timeout
            }
        );
        
        if (response.data.error || response.data.message) {
            const errorMsg = response.data.error || response.data.message;
            if (errorMsg.toLowerCase().includes('billing') || 
                errorMsg.toLowerCase().includes('quota') || 
                errorMsg.toLowerCase().includes('limit') ||
                errorMsg.toLowerCase().includes('credit')) {
                console.log('❌ ModelsLab: Billing/Quota Error -', errorMsg);
            } else {
                console.log('⚠️  ModelsLab: Other Error -', errorMsg);
            }
        } else {
            console.log('✅ ModelsLab: API key valid and working');
        }
    } catch (error) {
        if (error.response?.data?.error || error.response?.data?.message) {
            const errorMsg = error.response.data.error || error.response.data.message;
            if (errorMsg.toLowerCase().includes('billing') || 
                errorMsg.toLowerCase().includes('quota') || 
                errorMsg.toLowerCase().includes('limit') ||
                errorMsg.toLowerCase().includes('credit')) {
                console.log('❌ ModelsLab: Billing/Quota Error -', errorMsg);
            } else {
                console.log('⚠️  ModelsLab: API Error -', errorMsg);
            }
        } else {
            console.log('❌ ModelsLab: Connection failed -', error.message);
        }
    }
}

// Test OpenAI
async function testOpenAI() {
    if (!apiKeys.openai) {
        console.log('❌ OpenAI: No API key configured');
        return;
    }
    
    try {
        console.log('🔍 Testing OpenAI...');
        const response = await axios.post(
            'https://api.openai.com/v1/models',
            {},
            {
                headers: {
                    'Authorization': `Bearer ${apiKeys.openai}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        console.log('✅ OpenAI: API key valid and working');
    } catch (error) {
        if (error.response?.data?.error?.message) {
            const errorMsg = error.response.data.error.message;
            if (errorMsg.toLowerCase().includes('billing') || 
                errorMsg.toLowerCase().includes('quota') || 
                errorMsg.toLowerCase().includes('limit') ||
                errorMsg.toLowerCase().includes('credit') ||
                errorMsg.toLowerCase().includes('insufficient')) {
                console.log('❌ OpenAI: Billing/Quota Error -', errorMsg);
            } else {
                console.log('⚠️  OpenAI: API Error -', errorMsg);
            }
        } else {
            console.log('❌ OpenAI: Connection failed -', error.message);
        }
    }
}

// Test Gemini
async function testGemini() {
    if (!apiKeys.gemini) {
        console.log('❌ Gemini: No API key configured');
        return;
    }
    
    try {
        console.log('🔍 Testing Gemini...');
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeys.gemini}`,
            {
                contents: [{
                    parts: [{
                        text: 'Hello, this is a test.'
                    }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );
        console.log('✅ Gemini: API key valid and working');
    } catch (error) {
        if (error.response?.data?.error?.message) {
            const errorMsg = error.response.data.error.message;
            if (errorMsg.toLowerCase().includes('quota') || 
                errorMsg.toLowerCase().includes('limit') ||
                errorMsg.toLowerCase().includes('exceeded')) {
                console.log('❌ Gemini: Quota Error -', errorMsg);
            } else {
                console.log('⚠️  Gemini: API Error -', errorMsg);
            }
        } else {
            console.log('❌ Gemini: Connection failed -', error.message);
        }
    }
}

// Run tests
async function runTests() {
    await testHuggingFace();
    console.log('');
    await testReplicate();
    console.log('');
    await testModelsLab();
    console.log('');
    await testOpenAI();
    console.log('');
    await testGemini();
    
    console.log('\n📝 Summary:');
    console.log('If you see "Billing/Quota Error" messages, you need to:');
    console.log('1. Add billing information to your account');
    console.log('2. Purchase credits or upgrade your plan');
    console.log('3. Generate new API keys if needed');
    console.log('\nFor detailed solutions, see: BILLING_LIMIT_SOLUTION.md');
}

runTests().catch(console.error);
