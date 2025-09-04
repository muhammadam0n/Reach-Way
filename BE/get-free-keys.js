#!/usr/bin/env node

/**
 * Free API Key Setup Guide
 * This script helps you get free AI image generation API keys
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🎯 FREE AI IMAGE GENERATION SETUP\n');
console.log('This will help you get free API keys for AI image generation.\n');

console.log('📋 Current Status:');
console.log('✅ Gemini: Working (for prompts)');
console.log('❌ ModelsLab: Billing limit reached');
console.log('❌ OpenAI: Needs billing setup');
console.log('❌ Hugging Face: Not configured');
console.log('❌ Replicate: Not configured\n');

console.log('🚀 Let\'s get you free API keys!\n');

async function getHuggingFaceKey() {
    return new Promise((resolve) => {
        console.log('🔑 Step 1: Get Hugging Face API Key (FREE)');
        console.log('1. Go to: https://huggingface.co/');
        console.log('2. Sign up for a free account');
        console.log('3. Go to: https://huggingface.co/settings/tokens');
        console.log('4. Click "New token"');
        console.log('5. Name it "Media-Minds"');
        console.log('6. Select "Read" permissions');
        console.log('7. Copy the token (starts with "hf_")');
        console.log('');
        
        rl.question('Enter your Hugging Face API key (or press Enter to skip): ', (key) => {
            if (key.trim()) {
                resolve(key.trim());
            } else {
                resolve(null);
            }
        });
    });
}

async function getReplicateKey() {
    return new Promise((resolve) => {
        console.log('\n🔑 Step 2: Get Replicate API Key (FREE)');
        console.log('1. Go to: https://replicate.com/');
        console.log('2. Sign up for a free account');
        console.log('3. Go to: https://replicate.com/account/api-tokens');
        console.log('4. Click "Create API token"');
        console.log('5. Name it "Media-Minds"');
        console.log('6. Copy the token (starts with "r8_")');
        console.log('');
        
        rl.question('Enter your Replicate API key (or press Enter to skip): ', (key) => {
            if (key.trim()) {
                resolve(key.trim());
            } else {
                resolve(null);
            }
        });
    });
}

async function updateEnvFile(huggingfaceKey, replicateKey) {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Add or update the new keys
    const lines = envContent.split('\n');
    const newLines = [];
    let huggingfaceAdded = false;
    let replicateAdded = false;
    
    // Process existing lines
    for (const line of lines) {
        if (line.startsWith('HUGGINGFACE_API_KEY=')) {
            if (huggingfaceKey) {
                newLines.push(`HUGGINGFACE_API_KEY=${huggingfaceKey}`);
                huggingfaceAdded = true;
            }
        } else if (line.startsWith('REPLICATE_API_KEY=')) {
            if (replicateKey) {
                newLines.push(`REPLICATE_API_KEY=${replicateKey}`);
                replicateAdded = true;
            }
        } else if (line.trim()) {
            newLines.push(line);
        }
    }
    
    // Add new keys if not already present
    if (huggingfaceKey && !huggingfaceAdded) {
        newLines.push(`HUGGINGFACE_API_KEY=${huggingfaceKey}`);
    }
    if (replicateKey && !replicateAdded) {
        newLines.push(`REPLICATE_API_KEY=${replicateKey}`);
    }
    
    // Write back to .env file
    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log('\n✅ Environment variables updated!');
}

async function main() {
    try {
        const huggingfaceKey = await getHuggingFaceKey();
        const replicateKey = await getReplicateKey();
        
        if (huggingfaceKey || replicateKey) {
            await updateEnvFile(huggingfaceKey, replicateKey);
            
            console.log('\n🎉 Setup Complete!');
            console.log('\n📋 What you got:');
            if (huggingfaceKey) {
                console.log('✅ Hugging Face: 30,000 free requests/month');
            }
            if (replicateKey) {
                console.log('✅ Replicate: 500 free predictions/month');
            }
            
            console.log('\n🚀 Next Steps:');
            console.log('1. Restart your backend server');
            console.log('2. Try generating an image');
            console.log('3. Check the console logs to see which service is used');
            
            console.log('\n💡 Your system will now try:');
            console.log('1. Hugging Face (FREE)');
            console.log('2. Replicate (FREE)');
            console.log('3. OpenAI (if you add billing)');
            console.log('4. ModelsLab (if you subscribe)');
            console.log('5. Placeholder (emergency)');
            
        } else {
            console.log('\n⚠️  No API keys provided. You can still use the system with:');
            console.log('- OpenAI (if you add billing)');
            console.log('- ModelsLab (if you subscribe)');
            console.log('- Placeholder images (emergency fallback)');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

main();
