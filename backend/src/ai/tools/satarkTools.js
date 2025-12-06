const { GoogleGenerativeAI } = require("@google/generative-ai");
const turf = require("@turf/turf");

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
     * UPGRADE 1: THE MATH - Calculates exact geospatial overlap using Turf.js
     * @param {Object} claimPolygon - GeoJSON polygon of the claimed land
     * @param {Object} restrictedPolygon - GeoJSON polygon of protected/restricted area
     * @returns {Object} - Overlap analysis with exact percentage
     */
    calculateGeospatialOverlap: (claimPolygon, restrictedPolygon) => {
        try {
            // Validate inputs
            if (!claimPolygon || !restrictedPolygon) {
                return {
                    hasOverlap: false,
                    overlapPercentage: 0,
                    overlapArea: 0,
                    claimArea: 0,
                    restrictedArea: 0,
                    verdict: "INSUFFICIENT_DATA",
                    details: "One or both polygons are missing"
                };
            }

            // Create Turf polygon features
            const claimFeature = turf.polygon(claimPolygon.coordinates);
            const restrictedFeature = turf.polygon(restrictedPolygon.coordinates);

            // Calculate areas in hectares
            const claimArea = turf.area(claimFeature) / 10000; // m² to hectares
            const restrictedArea = turf.area(restrictedFeature) / 10000;

            // Calculate intersection
            let intersection = null;
            let overlapArea = 0;
            let overlapPercentage = 0;

            try {
                intersection = turf.intersect(turf.featureCollection([claimFeature, restrictedFeature]));
                if (intersection) {
                    overlapArea = turf.area(intersection) / 10000;
                    overlapPercentage = (overlapArea / claimArea) * 100;
                }
            } catch (e) {
                console.warn("Turf intersection failed:", e.message);
            }

            // Determine verdict
            let verdict = "CLEAR";
            let severity = "LOW";
            if (overlapPercentage > 50) {
                verdict = "CRITICAL_OVERLAP";
                severity = "CRITICAL";
            } else if (overlapPercentage > 20) {
                verdict = "SIGNIFICANT_OVERLAP";
                severity = "HIGH";
            } else if (overlapPercentage > 5) {
                verdict = "PARTIAL_OVERLAP";
                severity = "MEDIUM";
            } else if (overlapPercentage > 0) {
                verdict = "MINOR_OVERLAP";
                severity = "LOW";
            }

            return {
                hasOverlap: overlapPercentage > 0,
                overlapPercentage: Math.round(overlapPercentage * 100) / 100,
                overlapArea: Math.round(overlapArea * 1000) / 1000, // 3 decimal places
                claimArea: Math.round(claimArea * 1000) / 1000,
                restrictedArea: Math.round(restrictedArea * 1000) / 1000,
                verdict,
                severity,
                details: overlapPercentage > 0
                    ? `Claim overlaps ${overlapPercentage.toFixed(2)}% with protected area (${overlapArea.toFixed(3)} hectares)`
                    : "No overlap with protected areas detected"
            };
        } catch (error) {
            console.error("Turf.js Overlap Calculation Failed:", error);
            return {
                hasOverlap: false,
                overlapPercentage: 0,
                verdict: "CALCULATION_ERROR",
                details: error.message
            };
        }
    },

    /**
     * Enhanced verification combining Vision AI + Turf.js geometry
     * @param {Buffer} sitePhotoBuffer - Site photo
     * @param {String} satellitePhotoUrl - Satellite image URL
     * @param {Object} claimPolygon - GeoJSON of claimed land
     * @param {Object} protectedAreas - Array of protected area polygons
     * @returns {Object} - Combined analysis result
     */
    fullVerification: async (sitePhotoBuffer, satellitePhotoUrl, claimPolygon, protectedAreas = []) => {
        // 1. Vision Analysis
        const visionResult = await satarkTools.analyzeEvidence(sitePhotoBuffer, satellitePhotoUrl);

        // 2. Geometry Analysis (check against all protected areas)
        let worstOverlap = { overlapPercentage: 0, verdict: "CLEAR" };
        const overlapResults = [];

        for (const protected of protectedAreas) {
            const overlap = satarkTools.calculateGeospatialOverlap(claimPolygon, protected.polygon);
            overlap.areaName = protected.name || "Protected Area";
            overlapResults.push(overlap);

            if (overlap.overlapPercentage > worstOverlap.overlapPercentage) {
                worstOverlap = overlap;
            }
        }

        // 3. Combined Verdict
        const combinedScore = (visionResult.matchScore * 0.6) + ((100 - worstOverlap.overlapPercentage) * 0.4);

        return {
            vision: visionResult,
            geometry: {
                totalAreasChecked: protectedAreas.length,
                worstOverlap,
                allOverlaps: overlapResults
            },
            combinedScore: Math.round(combinedScore),
            verdict: worstOverlap.overlapPercentage > 20
                ? "REJECT: Significant overlap with protected area"
                : visionResult.matchScore < 50
                    ? "INVESTIGATE: Vision analysis shows concerns"
                    : "CLEAR: Vision confirms terrain, Turf.js confirms no major overlap",
            summary: `Vision Score: ${visionResult.matchScore}/100, Max Overlap: ${worstOverlap.overlapPercentage.toFixed(2)}%`
        };
    },

    /**
     * Verifies if the user's GPS coordinates are within the claim's boundary.
     * Now using Turf.js for accurate point-in-polygon
     */
    verifyCoordinates: (lat, lng, claimPolygon) => {
        try {
            const point = turf.point([lng, lat]); // GeoJSON is [lng, lat]
            const polygon = turf.polygon(claimPolygon.coordinates);

            const isInside = turf.booleanPointInPolygon(point, polygon);
            const centroid = turf.centroid(polygon);
            const distanceToCentroid = turf.distance(point, centroid, { units: 'meters' });

            return {
                isInside,
                distanceToCentroid: Math.round(distanceToCentroid),
                message: isInside
                    ? `Location verified: User is ${distanceToCentroid.toFixed(0)}m from claim center`
                    : `WARNING: User is OUTSIDE the claim boundary (${distanceToCentroid.toFixed(0)}m from center)`
            };
        } catch (error) {
            console.error("Coordinate verification failed:", error);
            return {
                isInside: false,
                distanceToCentroid: 0,
                message: "Verification failed: " + error.message
            };
        }
    },

    /**
     * Calculate the exact area of a claim polygon
     */
    calculateClaimArea: (claimPolygon) => {
        try {
            const polygon = turf.polygon(claimPolygon.coordinates);
            const areaInSquareMeters = turf.area(polygon);
            const areaInHectares = areaInSquareMeters / 10000;

            return {
                squareMeters: Math.round(areaInSquareMeters),
                hectares: Math.round(areaInHectares * 1000) / 1000,
                acres: Math.round((areaInHectares * 2.471) * 1000) / 1000,
                isOverLimit: areaInHectares > 4, // FRA limit
                message: areaInHectares > 4
                    ? `VIOLATION: Claimed area (${areaInHectares.toFixed(3)} ha) exceeds FRA limit of 4 hectares`
                    : `Area verified: ${areaInHectares.toFixed(3)} hectares within legal limit`
            };
        } catch (error) {
            return {
                squareMeters: 0,
                hectares: 0,
                acres: 0,
                isOverLimit: false,
                message: "Area calculation failed: " + error.message
            };
        }
    }
};

module.exports = satarkTools;
