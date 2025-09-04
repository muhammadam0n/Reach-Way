#!/usr/bin/env node

/**
 * Debug Image Generation
 * This script helps debug why images are coming out as blue placeholders
 */

const axios = require('axios');
require('dotenv').config();

console.log('🔍 Debugging Image Generation Issue...\n');

async function testReplicateDirectly() {
    console.log('🧪 Testing Replicate API directly...');
    
    try {
        const response = await axios.post(
            "https://api.replicate.com/v1/predictions",
            {
                version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
                input: {
                    prompt: "a beautiful sunset over mountains, digital art, high quality",
                    width: 512,
                    height: 512,
                    num_inference_steps: 20,
                    guidance_scale: 7.5,
                    negative_prompt: "blurry, low quality, distorted, blue"
                }
            },
            {
                headers: {
                    "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Replicate prediction started');
        console.log('📋 Prediction ID:', response.data.id);
        
        const predictionId = response.data.id;
        const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
        
        // Poll for completion
        for (let i = 0; i < 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const pollResponse = await axios.get(pollUrl, {
                headers: { "Authorization": `Token ${process.env.REPLICATE_API_KEY}` }
            });
            
            console.log(`⏳ Status (attempt ${i + 1}): ${pollResponse.data.status}`);
            
            if (pollResponse.data.status === 'succeeded') {
                const imageUrl = pollResponse.data.output[0];
                console.log('🎉 Image generated successfully!');
                console.log('📸 Image URL:', imageUrl);
                
                // Download and save the image
                const imgResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                const fs = require('fs');
                fs.writeFileSync('replicate-test-image.png', imgResp.data);
                console.log('💾 Image saved as: replicate-test-image.png');
                return true;
                
            } else if (pollResponse.data.status === 'failed') {
                console.log('❌ Generation failed:', pollResponse.data.error);
                return false;
            }
        }
        
        console.log('⏰ Generation timed out');
        return false;
        
    } catch (error) {
        console.error('❌ Replicate API error:', error.response?.data || error.message);
        return false;
    }
}

async function testHuggingFaceDirectly() {
    console.log('\n🧪 Testing Hugging Face API directly...');
    
    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
            {
                inputs: "a beautiful sunset over mountains, digital art, high quality",
                parameters: {
                    width: 512,
                    height: 512,
                    num_inference_steps: 20,
                    guidance_scale: 7.5,
                    negative_prompt: "blurry, low quality, distorted, blue"
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json"
                },
                responseType: 'arraybuffer',
                timeout: 30000
            }
        );
        
        if (response.status === 200 && response.data) {
            console.log('✅ Hugging Face image generated successfully!');
            
            // Save the image
            const fs = require('fs');
            fs.writeFileSync('huggingface-test-image.png', response.data);
            console.log('💾 Image saved as: huggingface-test-image.png');
            return true;
        } else {
            console.log('❌ Unexpected response from Hugging Face');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Hugging Face API error:', error.response?.status, error.response?.data || error.message);
        return false;
    }
}

async function testServerEndpoint() {
    console.log('\n🧪 Testing server endpoint...');
    
    try {
        const response = await axios.post('http://localhost:5000/api/ai/generate-image', {
            prompt: 'a beautiful sunset over mountains, digital art, high quality',
            width: 512,
            height: 512
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });
        
        if (response.data && response.data.imageBase64) {
            console.log('✅ Server endpoint working!');
            console.log('📊 Image data length:', response.data.imageBase64.length);
            
            // Save the image
            const fs = require('fs');
            const imageData = response.data.imageBase64.replace('data:image/png;base64,', '');
            fs.writeFileSync('server-test-image.png', Buffer.from(imageData, 'base64'));
            console.log('💾 Image saved as: server-test-image.png');
            return true;
        } else {
            console.log('❌ No image data from server');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Server endpoint error:', error.response?.data || error.message);
        return false;
    }
}

async function main() {
    console.log('🔑 API Keys Status:');
    console.log('Replicate:', process.env.REPLICATE_API_KEY ? '✅ Present' : '❌ Missing');
    console.log('Hugging Face:', process.env.HUGGINGFACE_API_KEY ? '✅ Present' : '❌ Missing');
    console.log('');
    
    // Test APIs directly
    const replicateSuccess = await testReplicateDirectly();
    const huggingfaceSuccess = await testHuggingFaceDirectly();
    
    // Test server if APIs work
    if (replicateSuccess || huggingfaceSuccess) {
        await testServerEndpoint();
    }
    
    console.log('\n📝 Summary:');
    console.log('Replicate:', replicateSuccess ? '✅ Working' : '❌ Failed');
    console.log('Hugging Face:', huggingfaceSuccess ? '✅ Working' : '❌ Failed');
    
    if (!replicateSuccess && !huggingfaceSuccess) {
        console.log('\n🔧 Recommendations:');
        console.log('1. Check your API keys are correct');
        console.log('2. Verify you have credits/quota remaining');
        console.log('3. Try a different prompt');
        console.log('4. Check the saved images to see what\'s being generated');
    }
}

main().catch(console.error);
