const axios = require('axios');

async function testRegistration() {
    console.log('🧪 Testing Registration API...\n');
    
    const baseURL = 'http://localhost:5000';
    
    const testUsers = [
        {
            username: 'testuser1',
            email: 'test1@example.com',
            password: 'password123'
        },
        {
            username: 'testuser2',
            email: 'test2@example.com',
            password: 'password123'
        }
    ];
    
    for (const user of testUsers) {
        try {
            console.log(`📤 Registering ${user.username}...`);
            
            const response = await axios.post(`${baseURL}/api/auth/register`, user, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`✅ Success: ${response.data.message}`);
            console.log(`   User ID: ${response.data.user.id}`);
            console.log(`   Token: ${response.data.token.substring(0, 20)}...\n`);
            
        } catch (error) {
            console.log(`❌ Error registering ${user.username}:`);
            
            if (error.response) {
                // Server responded with error
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Error: ${JSON.stringify(error.response.data)}\n`);
            } else if (error.request) {
                // No response received
                console.log('   No response from server. Is it running?\n');
            } else {
                // Other errors
                console.log(`   ${error.message}\n`);
            }
        }
    }
    
    console.log('🧪 Testing Login API...\n');
    
    // Test login
    try {
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'test1@example.com',
            password: 'password123'
        });
        
        console.log(`✅ Login Success: ${loginResponse.data.message}`);
        console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...\n`);
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
    }
    
    console.log('🎉 Testing complete!');
}

// Run the test
testRegistration();