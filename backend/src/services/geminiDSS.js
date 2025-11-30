/**
 * Gemini Decision Support System (DSS)
 * Recommends government schemes based on claim and asset data
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Recommend government schemes based on claimant and asset data
 * @param {Object} claimantData - Claimant information (name, village, landSize, etc.)
 * @param {Object} assetData - Asset analysis (forestHa, farmlandHa, waterAreasHa, etc.)
 * @returns {Promise<Object>} Recommended schemes with eligibility
 */
async function recommendSchemes(claimantData, assetData) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

        const prompt = `
You are an expert in Indian government welfare schemes for rural communities.

Claimant Profile:
- Name: ${claimantData.claimantName || 'Unknown'}
- Village: ${claimantData.village || 'Unknown'}
- Land Claimed: ${claimantData.landSizeClaimed || 0} hectares  
- Claim Type: ${claimantData.claimType || 'Individual'}

Land Analysis:
- Forest Area: ${assetData.forestHa || 0} ha
- Farmland: ${assetData.farmlandHa || 0} ha
- Water Bodies: ${assetData.waterAreasHa || 0} ha
- Homesteads: ${assetData.homesteadCount || 0}

Based on this profile, recommend applicable Indian government schemes from this list:
1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi) - ₹6000/year for landholders
2. Forest Rights Act (FRA) Title Deed - Legal recognition of forest land rights
3. MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) - 100 days wage employment
4. Kisan Credit Card (KCC) - Agricultural credit
5. Soil Health Card Scheme
6. PM Fasal Bima Yojana - Crop insurance
7. National Bamboo Mission (if forest area)
8. PM Kusum Yojana - Solar pump subsidies

Return ONLY valid JSON array (no markdown):

[
  {
    "schemeName": "string",
    "eligibility": "Eligible" | "Partially Eligible" | "Not Eligible",
    "reason": "brief explanation why",
    "estimatedBenefit": "monetary or other benefit",
    "priority": "High" | "Medium" | "Low",
    "nextSteps": ["action1", "action2"]
  }
]

Return 3-5 most relevant schemes. Prioritize schemes the family is definitely eligible for.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Gemini did not return valid JSON array');
        }

        const schemes = JSON.parse(jsonMatch[0]);

        // Add metadata
        return {
            schemes: schemes,
            generatedAt: new Date().toISOString(),
            processor: 'gemini-2.0-flash-exp-dss',
            profileSummary: {
                totalLand: claimantData.landSizeClaimed || 0,
                forestCover: assetData.forestHa || 0,
                farmland: assetData.farmlandHa || 0
            }
        };

    } catch (error) {
        console.error('Gemini DSS recommendation failed:', error.message);
        throw new Error(`Scheme recommendation failed: ${error.message}`);
    }
}

module.exports = {
    recommendSchemes
};
