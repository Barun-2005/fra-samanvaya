const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const satarkTools = {
    /**
     * Analyzes evidence by comparing a site photo with a satellite snapshot.
     * @param {Buffer} sitePhotoBuffer - The uploaded site photo.
     * @param {String} satellitePhotoUrl - The URL of the satellite snapshot.
     * @returns {Promise<Object>} - Analysis result with match score and description.
     */
    analyzeEvidence: async (sitePhotoBuffer, satellitePhotoUrl) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            // Convert buffer to base64 for Gemini
            const sitePhotoBase64 = sitePhotoBuffer.toString('base64');

            // Fetch Satellite Image
            let satelliteBuffer = null;
            try {
                if (satellitePhotoUrl && satellitePhotoUrl.startsWith('http')) {
                    // Use native fetch (Node 18+)
                    const response = await fetch(satellitePhotoUrl);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        satelliteBuffer = Buffer.from(arrayBuffer);
                    } else {
                        console.warn(`Satark: Failed to fetch satellite image. Status: ${response.status}`);
                    }
                }
            } catch (err) {
                console.warn("Satark: Failed to fetch satellite image:", err.message);
            }

            // PROMPT
            const prompt = `
        You are Satark, a Vigilance AI for the Forest Rights Act.
        Compare these two images:
        1. IMAGE 1: A ground-level photo taken by a Field Worker.
        2. IMAGE 2: A satellite snapshot of the claimed land.

        Task:
        - Verify if the terrain features (trees, water bodies, slope) match.
        - Estimate the tree cover density in both.
        - Detect any signs of recent deforestation or encroachment.
        - Assign a "Match Score" from 0 to 100.
        - Give a "Discrepancy Score" (0-100) where 0 is perfect match and 100 is total mismatch.

        Output JSON:
        {
          "analysis": "Detailed observation...",
          "matchScore": 85,
          "discrepancyScore": 15,
          "flags": ["Deforestation detected", "Water body mismatch"]
        }
      `;

            const imageParts = [
                {
                    inlineData: {
                        data: sitePhotoBase64,
                        mimeType: "image/jpeg",
                    },
                }
            ];

            if (satelliteBuffer) {
                imageParts.push({
                    inlineData: {
                        data: satelliteBuffer.toString('base64'),
                        mimeType: "image/jpeg",
                    },
                });
            } else {
                console.log("Satark: Only analyzing site photo (Satellite fetch failed)");
            }

            const result = await model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const text = response.text();

            // Clean JSON
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.error("Satark Evidence Analysis Failed:", error);
            return {
                analysis: "AI Analysis Failed. Please verify manually.",
                matchScore: 0,
                discrepancyScore: 0,
                flags: ["System Error"]
            };
        }
    },

    /**
     * Verifies if the user's GPS coordinates are within the claim's boundary.
     * @param {Number} lat - User's latitude.
     * @param {Number} lng - User's longitude.
     * @param {Object} claimPolygon - GeoJSON polygon of the claim.
     * @returns {Object} - Verification result.
     */
    verifyCoordinates: (lat, lng, claimPolygon) => {
        // Simple point-in-polygon check (Ray Casting algorithm or using a library like turf.js)
        // For MVP, we'll use a simplified bounding box check or a placeholder if turf isn't installed.
        // Let's assume we can use a basic ray casting implementation here.

        const isInside = (point, vs) => {
            // ray-casting algorithm based on
            // https://github.com/substack/point-in-polygon
            const x = point[0], y = point[1];
            let inside = false;
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                const xi = vs[i][0], yi = vs[i][1];
                const xj = vs[j][0], yj = vs[j][1];

                const intersect = ((yi > y) !== (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        };

        // Extract coordinates from GeoJSON
        // GeoJSON Polygon coordinates are [[[x,y], [x,y], ...]]
        const polygonCoords = claimPolygon.coordinates[0];
        const inside = isInside([lng, lat], polygonCoords); // GeoJSON is [lng, lat]

        return {
            isInside: inside,
            distanceToCentroid: 0 // Placeholder
        };
    }
};

module.exports = satarkTools;
