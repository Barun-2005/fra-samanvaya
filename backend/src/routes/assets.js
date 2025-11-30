const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeAsset } = require('../controllers/assetController');
const { requireAuth } = require('../middlewares/authMiddleware');

const upload = multer({ dest: process.env.UPLOADS_DIR || 'uploads/' });

// Route to handle asset analysis, expects multipart/form-data
router.post('/analyze', requireAuth, upload.single('snapshot'), analyzeAsset);

// Route to analyze an existing claim by ID
router.post('/analyze/:claimId', requireAuth, async (req, res) => {
    try {
        const Claim = require('../models/Claim');
        const { analyzeLandAssets } = require('../services/geminiAsset');

        const claim = await Claim.findById(req.params.claimId);
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        // Analyze the claim's geojson boundary
        const bbox = calculateBoundingBox(claim.geojson);
        const analysis = await analyzeLandAssets(claim.geojson, bbox);

        // Update claim with analysis results
        claim.assetSummary = analysis.assetSummary;
        await claim.save();

        res.json(analysis);
    } catch (error) {
        console.error('AI analysis error:', error);
        res.status(500).json({ message: 'AI analysis failed: ' + error.message });
    }
});

// Helper function to calculate bounding box
function calculateBoundingBox(geojson) {
    if (!geojson || !geojson.coordinates || !geojson.coordinates[0]) {
        return [0, 0, 0, 0];
    }

    const coords = geojson.coordinates[0];
    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);

    return [
        Math.min(...lons),
        Math.min(...lats),
        Math.max(...lons),
        Math.max(...lats)
    ];
}

module.exports = router;
