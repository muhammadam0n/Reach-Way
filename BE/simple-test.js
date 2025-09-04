const axios = require('axios');

async function testEndpoint() {
    try {
        console.log('Testing server connection...');
        
        // First test if server is responding
        const healthCheck = await axios.get('http://localhost:5000/api/ai/generate-image', {
            timeout: 5000
        });
        console.log('Server is responding');
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running on port 5000');
        } else if (error.response?.status === 405) {
            console.log('✅ Server is running, but GET method not allowed (expected)');
            console.log('Now testing POST method...');
            
            // Test POST method
            try {
                const response = await axios.post('http://localhost:5000/api/ai/generate-image', {
                    prompt: 'test'
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });
                console.log('✅ POST request successful!');
                console.log('Response:', response.data);
            } catch (postError) {
                console.log('❌ POST request failed:', postError.response?.data || postError.message);
            }
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
}

testEndpoint();
