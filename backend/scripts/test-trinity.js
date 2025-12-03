const axios = require('axios');

const API_URL = 'http://localhost:4000/api/chat';

async function testAgent(role, message, image = null) {
    console.log(`\n--- Testing ${role.toUpperCase()} Agent ---`);
    console.log(`Input: "${message}"`);
    if (image) console.log(`[Image Attached]`);

    try {
        const payload = { role, message };
        if (image) payload.image = image;

        const response = await axios.post(API_URL, payload);
        console.log(`Response: ${response.data.response}`);
        console.log(`Session ID: ${response.data.sessionId}`);
    } catch (error) {
        console.error(`Error: ${error.response?.data?.message || error.message}`);
    }
}

async function runTests() {
    // 1. Mitra (Citizen) - Scheme Search
    await testAgent('citizen', 'I am a farmer with 2 acres. Any schemes?');

    // 2. Vidhi (Official) - Legal Search
    await testAgent('official', 'What are the rights of OTFDs under Section 3(1)?');

    // 3. Satark (Field) - Verification (Text only for now)
    await testAgent('field_officer', 'I am verifying a claim. The land looks like forest land, not farmland.');
}

runTests();
