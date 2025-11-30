/**
 * Simple test for Gemini Asset Service
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { analyzeByCoordinates } = require('../src/services/assetService');

async function quickTest() {
    console.log('🧪 Testing Gemini Asset Service...\n');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);

    const testPolygon = {
        type: 'Polygon',
        coordinates: [[[85.8245, 20.2961], [85.8345, 20.2961], [85.8345, 20.3061], [85.8245, 20.3061], [85.8245, 20.2961]]]
    };

    const bbox = [85.8245, 20.2961, 85.8345, 20.3061];
    const userClaim = { type: 'Farmland' };

    try {
        const result = await analyzeByCoordinates(testPolygon, bbox, userClaim, 2.5);

        console.log('\n✅ Analysis Complete!\n');
        console.log('Land Cover:', result.landCover);
        console.log(`\n🎯 Veracity Score: ${result.veracityScore}/100`);
        console.log(`📈 Level: ${result.veracityLevel}`);
        console.log(`🤖 Assessment: ${result.aiAssessment}`);
        console.log('\n🎉 Gemini Asset Service is OPERATIONAL\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

quickTest();
