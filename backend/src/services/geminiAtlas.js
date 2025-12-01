const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeRegion(geojson, totalClaims, claimStats) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        const prompt = `
      Analyze the following region data for a Forest Rights Act (FRA) implementation project in India.
      
      Region Geometry (GeoJSON): ${JSON.stringify(geojson)}
      
      Current FRA Implementation Status:
      - Total Claims Submitted: ${totalClaims}
      - Pending: ${claimStats.pending || 0}
      - Verified: ${claimStats.verified || 0}
      - Approved: ${claimStats.approved || 0}
      - Rejected: ${claimStats.rejected || 0}

      Task:
      1. Estimate the approximate land cover breakdown (Forest, Farmland, Water bodies, Habitation) based on the geometry (simulate this analysis as if you had satellite access, providing realistic estimates for a rural Indian forest region).
      2. Analyze the claim statistics. Is the rejection rate high? Is the implementation slow?
      3. Suggest 3 specific government schemes that would be beneficial for this region based on the land type and claim status (e.g., if high farmland, suggest PM-KISAN; if high forest, suggest Van Dhan Vikas Yojana).
      4. Provide a "Transparency Score" (0-100) based on the approval ratio.

      Return ONLY a JSON object with this structure:
      {
        "landCover": {
          "forestPercentage": 40,
          "farmlandPercentage": 30,
          "waterPercentage": 10,
          "habitationPercentage": 20
        },
        "analysis": "Brief text analysis of the region...",
        "schemes": [
          { "name": "Scheme Name", "reason": "Why it fits" }
        ],
        "transparencyScore": 75,
        "recommendations": ["Rec 1", "Rec 2"]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from markdown code block if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Invalid JSON response from Gemini');
        }

        const jsonString = jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Gemini Atlas Analysis Error:', error);
        // Fallback for demo if API fails
        return {
            landCover: { forestPercentage: 50, farmlandPercentage: 30, waterPercentage: 10, habitationPercentage: 10 },
            analysis: "Automated analysis failed. Showing estimated data.",
            schemes: [{ name: "MGNREGA", reason: "General rural employment" }],
            transparencyScore: 50,
            recommendations: ["Verify API connection"]
        };
    }
}

module.exports = { analyzeRegion };
