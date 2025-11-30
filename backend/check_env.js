require('dotenv').config({ path: '../.env' });

console.log('Checking GEMINI_API_KEY...');
if (process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY is Present');
    console.log('Key length:', process.env.GEMINI_API_KEY.length);
    console.log('Key starts with:', process.env.GEMINI_API_KEY.substring(0, 4) + '...');
} else {
    console.log('GEMINI_API_KEY is MISSING');
}
