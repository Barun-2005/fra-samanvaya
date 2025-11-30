/**
 * Gemini Asset Service (Primary Intelligence Engine)
 * Analyzes satellite imagery to verify land claims and calculate veracity scores
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze satellite image and calculate claim veracity
 * @param {Buffer} imageBuffer - Satellite image of the land plot
 * @param {string} mimeType - Image MIME type
 * @param {Object} userClaim - What the user claimed
 * @param {number} claimedArea - Area in hectares
 * @returns {Object} Analysis results with veracity score
 */
async function analyzeSatelliteImage(imageBuffer, mimeType, userClaim, claimedArea = 1.0) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `
You are a satellite imagery analyst for the Forest Rights Act (FRA) in India.

Analyze this satellite image of a land plot and provide:
1. **Land Cover Distribution** (as percentages):
   - Forest (dense trees, vegetation)
   - Farmland (crops, cultivated soil, agricultural patterns)
   - Water (rivers, ponds, lakes)
   - Settlement (houses, buildings, roads)

2. **Claim Veracity Assessment**:
   - User Claims: "${userClaim.type || 'Farmland'}" (${claimedArea} hectares)
   - Compare visual evidence against the claim
   - Score from 0-100:
     * 90-100: Strong evidence supports claim
     * 70-89: Moderate evidence, some discrepancies
     * 50-69: Weak evidence, significant discrepancies
     * 0-49: Evidence contradicts claim (possible encroachment/fraud)

3. **AI Assessment**: Brief explanation of your reasoning.

Return ONLY valid JSON (no markdown):

{
  "landCover": {
    "forest": number (percentage 0-100),
    "farmland": number (percentage 0-100),
    "water": number (percentage 0-100),
    "settlement": number (percentage 0-100)
  },
  "veracityScore": number (0-100),
  "veracityLevel": "High" | "Medium" | "Low" | "Critical",
  "aiAssessment": "string (1-2 sentences explaining the score)",
  "warnings": ["string"] (array of potential issues, can be empty),
  "confidence": number (0.0-1.0, your confidence in this analysis)
}

Total percentages in landCover should sum to approximately 100.
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Gemini did not return valid JSON format');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // Add metadata
        analysis.analyzedAt = new Date().toISOString();
        analysis.processor = 'gemini-2.0-flash-exp';
        analysis.claimedArea = claimedArea;
        analysis.userClaim = userClaim;

        // Calculate land areas in hectares
        analysis.landAreasHa = {
            forestHa: (analysis.landCover.forest / 100) * claimedArea,
            farmlandHa: (analysis.landCover.farmland / 100) * claimedArea,
            waterHa: (analysis.landCover.water / 100) * claimedArea,
            settlementHa: (analysis.landCover.settlement / 100) * claimedArea
        };

        return analysis;

    } catch (error) {
        console.error('Gemini satellite analysis failed:', error.message);
        throw new Error(`Satellite image analysis failed: ${error.message}`);
    }
}

/**
 * Fallback: Analyze land without satellite image (using coordinates only)
 */
async function analyzeByCoordinates(polygon, bbox, userClaim, claimedArea) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const area = claimedArea || calculatePolygonArea(polygon);

        const prompt = `
You are analyzing a ${area.toFixed(2)} hectare land plot in rural India for Forest Rights Act verification.

User Claims: "${userClaim.type || 'Farmland'}"
Location: Bounding Box ${JSON.stringify(bbox)}

Without satellite imagery, provide a conservative estimate based on typical rural Indian land patterns:

Return ONLY valid JSON:

{
  "landCover": {
    "forest": number,
    "farmland": number,
    "water": number,
    "settlement": number
  },
  "veracityScore": 50,
  "veracityLevel": "Medium",
  "aiAssessment": "Analysis based on coordinates only. Satellite imagery recommended for verification.",
  "warnings": ["No satellite image provided - veracity score is estimated"],
  "confidence": 0.5
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysis = JSON.parse(jsonMatch[0]);

        analysis.analyzedAt = new Date().toISOString();
        analysis.processor = 'gemini-2.0-flash-exp-coordinates';
        analysis.claimedArea = area;
        analysis.userClaim = userClaim;

        analysis.landAreasHa = {
            forestHa: (analysis.landCover.forest / 100) * area,
            farmlandHa: (analysis.landCover.farmland / 100) * area,
            waterHa: (analysis.landCover.water / 100) * area,
            settlementHa: (analysis.landCover.settlement / 100) * area
        };

        return analysis;

    } catch (error) {
        console.error('Gemini coordinate analysis failed:', error.message);
        throw error;
    }
}

/**
 * Calculate approximate polygon area in hectares
 */
function calculatePolygonArea(polygon) {
    if (!polygon || !polygon.coordinates) return 1.0;

    const coords = polygon.coordinates[0];
    if (!coords || coords.length < 4) return 1.0;

    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const width = (maxLon - minLon) * 111 * 1000;
    const height = (maxLat - minLat) * 111 * 1000;
    const areaM2 = width * height;
    const areaHa = areaM2 / 10000;

    return Math.max(areaHa, 0.1);
}

module.exports = {
    analyzeSatelliteImage,
    analyzeByCoordinates,
    calculatePolygonArea
};
