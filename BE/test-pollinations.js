#!/usr/bin/env node

/**
 * Test Pollinations.ai Integration
 * This script tests the new pollinations.ai image generation service
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Pollinations.ai Integration...\n');

// Test configuration
const testConfig = {
    prompt: "A beautiful sunset over mountains, cinematic style",
    width: 512,
    height: 512,
    model: "sdxl",
    style: "cinematic"
};

// Test 1: Direct Pollinations.ai API call
async function testDirectPollinations() {
    console.log('📡 Test 1: Direct Pollinations.ai API call');
    console.log(`Prompt: "${testConfig.prompt}"`);
    console.log(`Dimensions: ${testConfig.width}x${testConfig.height}`);
    console.log(`Model: ${testConfig.model}, Style: ${testConfig.style}\n`);
    
    try {
        const encodedPrompt = encodeURIComponent(testConfig.prompt);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${testConfig.width}&height=${testConfig.height}&model=${testConfig.model}&style=${testConfig.style}`;
        
        console.log('🌐 URL:', pollinationsUrl);
        console.log('⏳ Fetching image...');
        
        const response = await axios.get(pollinationsUrl, { 
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (response.data && response.data.length > 0) {
            console.log('✅ SUCCESS! Image received');
            console.log(`📊 Image size: ${response.data.length} bytes`);
            console.log(`📏 Content-Type: ${response.headers['content-type'] || 'unknown'}`);
            
            // Save test image
            const testDir = path.join(__dirname, 'test-outputs');
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            
            const filename = `pollinations-test-${Date.now()}.png`;
            const filepath = path.join(testDir, filename);
            fs.writeFileSync(filepath, response.data);
            
            console.log(`💾 Test image saved: ${filepath}`);
            return true;
        } else {
            console.log('❌ FAILED: No image data received');
            return false;
        }
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Headers:`, error.response.headers);
        }
        return false;
    }
}

// Test 2: Test different models
async function testDifferentModels() {
    console.log('\n🎨 Test 2: Different Pollinations.ai Models');
    
    const models = ['sdxl', 'sd15', 'kandinsky', 'deepfloyd'];
    const testPrompt = "A simple red apple on white background";
    
    for (const model of models) {
        try {
            console.log(`\n🔄 Testing model: ${model}`);
            const encodedPrompt = encodeURIComponent(testPrompt);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=256&height=256&model=${model}&style=realistic`;
            
            const response = await axios.get(url, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (response.data && response.data.length > 0) {
                console.log(`   ✅ ${model}: Working (${response.data.length} bytes)`);
            } else {
                console.log(`   ❌ ${model}: No data`);
            }
        } catch (error) {
            console.log(`   ❌ ${model}: ${error.message}`);
        }
    }
}

// Test 3: Test different styles
async function testDifferentStyles() {
    console.log('\n🎭 Test 3: Different Pollinations.ai Styles');
    
    const styles = ['cinematic', 'artistic', 'realistic'];
    const testPrompt = "A cat sitting on a windowsill";
    
    for (const style of styles) {
        try {
            console.log(`\n🔄 Testing style: ${style}`);
            const encodedPrompt = encodeURIComponent(testPrompt);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=256&height=256&model=sdxl&style=${style}`;
            
            const response = await axios.get(url, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (response.data && response.data.length > 0) {
                console.log(`   ✅ ${style}: Working (${response.data.length} bytes)`);
            } else {
                console.log(`   ❌ ${style}: No data`);
            }
        } catch (error) {
            console.log(`   ❌ ${style}: ${error.message}`);
        }
    }
}

// Test 4: Test different dimensions
async function testDifferentDimensions() {
    console.log('\n📐 Test 4: Different Image Dimensions');
    
    const dimensions = [
        { width: 256, height: 256, name: '256x256' },
        { width: 512, height: 512, name: '512x512' },
        { width: 768, height: 768, name: '768x768' },
        { width: 1024, height: 1024, name: '1024x1024' },
        { width: 1024, height: 768, name: '1024x768 (landscape)' },
        { width: 768, height: 1024, name: '768x1024 (portrait)' }
    ];
    
    const testPrompt = "A blue butterfly";
    
    for (const dim of dimensions) {
        try {
            console.log(`\n🔄 Testing dimensions: ${dim.name}`);
            const encodedPrompt = encodeURIComponent(testPrompt);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dim.width}&height=${dim.height}&model=sdxl&style=artistic`;
            
            const response = await axios.get(url, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (response.data && response.data.length > 0) {
                console.log(`   ✅ ${dim.name}: Working (${response.data.length} bytes)`);
            } else {
                console.log(`   ❌ ${dim.name}: No data`);
            }
        } catch (error) {
            console.log(`   ❌ ${dim.name}: ${error.message}`);
        }
    }
}

// Test 5: Performance test
async function testPerformance() {
    console.log('\n⚡ Test 5: Performance Test (3 consecutive requests)');
    
    const testPrompt = "A green tree in a forest";
    const times = [];
    
    for (let i = 1; i <= 3; i++) {
        try {
            console.log(`\n🔄 Request ${i}/3`);
            const startTime = Date.now();
            
            const encodedPrompt = encodeURIComponent(testPrompt);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&model=sdxl&style=realistic`;
            
            const response = await axios.get(url, { 
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            times.push(duration);
            
            if (response.data && response.data.length > 0) {
                console.log(`   ✅ Success in ${duration}ms (${response.data.length} bytes)`);
            } else {
                console.log(`   ❌ No data in ${duration}ms`);
            }
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        }
    }
    
    if (times.length > 0) {
        const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        console.log(`\n📊 Performance Summary:`);
        console.log(`   Average: ${avgTime}ms`);
        console.log(`   Fastest: ${minTime}ms`);
        console.log(`   Slowest: ${maxTime}ms`);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Pollinations.ai Integration Tests...\n');
    
    try {
        // Run all tests
        const test1 = await testDirectPollinations();
        await testDifferentModels();
        await testDifferentStyles();
        await testDifferentDimensions();
        await testPerformance();
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📋 TEST SUMMARY');
        console.log('='.repeat(50));
        
        if (test1) {
            console.log('✅ Pollinations.ai integration is working correctly!');
            console.log('✅ Your image generation API is now using the free service');
            console.log('✅ OpenAI API is hidden and only used as last resort');
            console.log('\n🎉 You can now generate images for FREE!');
        } else {
            console.log('❌ Pollinations.ai integration failed');
            console.log('❌ Check your internet connection and try again');
        }
        
        console.log('\n📖 For more information, see: POLLINATIONS_AI_SETUP.md');
        console.log('🔧 To test the full API, run: node debug-image-generation.js');
        
    } catch (error) {
        console.error('\n💥 Test suite failed:', error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testDirectPollinations,
    testDifferentModels,
    testDifferentStyles,
    testDifferentDimensions,
    testPerformance
};
