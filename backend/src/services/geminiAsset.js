/**
 * Gemini Asset Analysis Service
 * Replaces U-Net satellite service with Gemini-based land classification
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze land using Gemini (simulated satellite analysis)
 * @param {Object} polygon - GeoJSON polygon
 * @param {number[]} bbox - Bounding box [minx, miny, maxx, maxy]
 * @returns {Object} Asset analysis results with GeoJSON layers
 */
async function analyzeLandAssets(polygon, bbox) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

        // Calculate area in hectares (rough approximation)
        const area = calculatePolygonArea(polygon);

        const prompt = `
You are a Forest Rights Act land classification expert analyzing a ${area.toFixed(2)} hectare plot in India.

Given this land area, provide a realistic distribution estimate for:
- Forest cover
- Water bodies
- Farmland
- Settlements

Return ONLY valid JSON (no markdown):

{
  "forestHa": number (hectares of forest),
  "waterHa": number (hectares of water bodies),
  "farmlandHa": number (hectares of cultivated land),
  "settlementsHa": number (hectares of settlements),
  "homesteadCount": number (estimated dwellings),
  "confidence": 0.0 to 1.0,
  "analysis": "brief description of land composition",
  "recommendedSchemes": ["PM-KISAN", "Forest Rights Act", etc.]
}

The total should approximately equal ${area.toFixed(2)} hectares.
Provide realistic Indian rural land distribution.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Gemini did not return valid JSON');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // Create GeoJSON layers (simplified - using bounding box as approximation)
        const forestGeoJSON = createLayerGeoJSON(bbox, 'forest', analysis.forestHa);
        const waterGeoJSON = createLayerGeoJSON(bbox, 'water', analysis.waterHa);
        const farmlandGeoJSON = createLayerGeoJSON(bbox, 'farmland', analysis.farmlandHa);

        return {
            forest: forestGeoJSON,
            water: waterGeoJSON,
            farmland: farmlandGeoJSON,
            metadata: {
                totalArea: area,
                processing_timestamp: new Date().toISOString(),
                method: 'gemini-1.5-flash-simulation',
                bbox: bbox,
                confidence: analysis.confidence,
                analysis: analysis.analysis,
                recommendedSchemes: analysis.recommendedSchemes || []
            },
            assetSummary: {
                forestHa: analysis.forestHa,
                waterAreasHa: analysis.waterHa,
                farmlandHa: analysis.farmlandHa,
                homesteadCount: analysis.homesteadCount,
                modelVersion: 'gemini-1.5-flash-v1'
            }
        };

    } catch (error) {
        console.error('Gemini asset analysis failed:', error.message);
        throw new Error(`Asset analysis failed: ${error.message}`);
    }
}

/**
 * Calculate approximate area of polygon in hectares
 */
function calculatePolygonArea(polygon) {
    if (!polygon || !polygon.coordinates) return 1.0;

    const coords = polygon.coordinates[0];
    if (!coords || coords.length < 4) return 1.0;

    // Simple bounding box area calculation (rough approximation)
    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // 1 degree ≈ 111 km, convert to hectares
    const width = (maxLon - minLon) * 111 * 1000; // meters
    const height = (maxLat - minLat) * 111 * 1000; // meters
    const areaM2 = width * height;
    const areaHa = areaM2 / 10000; // convert to hectares

    return Math.max(areaHa, 0.1); // minimum 0.1 ha
}

/**
 * Create simplified GeoJSON layer
 */
function createLayerGeoJSON(bbox, type, areaHa) {
    if (areaHa <= 0) {
        return { type: 'FeatureCollection', features: [] };
    }

    const [minx, miny, maxx, maxy] = bbox;

    // Create a simple polygon within the bbox
    return {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [minx, miny],
                    [maxx, miny],
                    [maxx, maxy],
                    [minx, maxy],
                    [minx, miny]
                ]]
            },
            properties: {
                type: type,
                area_ha: areaHa,
                confidence: 0.7,
                source: 'gemini-analysis'
            }
        }]
    };
}

module.exports = {
    analyzeLandAssets,
    calculatePolygonArea
};
