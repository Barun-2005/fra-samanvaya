const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

/**
 * Match schemes to a village based on demographics and land data
 * @param {Object} villageData 
 * @returns {Promise<Array>} List of recommended schemes
 */
exports.matchSchemes = async (villageData) => {
    try {
        const prompt = `
        You are a government policy expert. Based on the following village data, recommend 3 most suitable government schemes (Central or State) for development.
        
        Village Data:
        - Name: ${villageData.name}
        - District: ${villageData.district}
        - Total Claims Approved: ${villageData.approvedClaims}
        - Total Land Recognized: ${villageData.totalLand} hectares
        - Primary Crop/Land Use: ${villageData.landUse || 'Mixed Agriculture/Forest'}
        
        Return the response as a JSON array of objects with the following structure:
        [
            {
                "schemeName": "Name of the scheme",
                "relevanceScore": 95,
                "reason": "Why it fits this village",
                "benefits": "Key benefits"
            }
        ]
        Do not include markdown formatting, just raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up markdown if present
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error matching schemes:", error);
        return [];
    }
};
