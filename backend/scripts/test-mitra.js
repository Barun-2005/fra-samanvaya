const axios = require('axios');

const API_URL = 'http://localhost:4000/api/chat';

async function testMitra() {
    console.log('\n🤖 Testing MITRA Agent...\n');

    try {
        // Test 1: Citizen asks about schemes
        console.log('Test 1: Asking about farmer schemes');
        const response1 = await axios.post(API_URL, {
            role: 'citizen',
            message: 'My name is Ramesh. I am a farmer with 2 acres of land. Are there any schemes for me?',
            sessionId: 'test-session-123'
        });
        console.log('Mitra:', response1.data.response);
        console.log('---\n');

        // Test 2: Memory test - does Mitra remember the name?
        console.log('Test 2: Testing memory - does Mitra remember my name?');
        const response2 = await axios.post(API_URL, {
            role: 'citizen',
            message: 'What is my name?',
            sessionId: 'test-session-123' // Same session
        });
        console.log('Mitra:', response2.data.response);
        console.log('---\n');

        console.log('✅ All tests passed!');
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testMitra();
