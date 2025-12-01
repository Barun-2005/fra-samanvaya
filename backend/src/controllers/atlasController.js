const { analyzeRegion } = require('../services/geminiAtlas');
const Claim = require('../models/Claim');

exports.analyzeRegion = async (req, res) => {
    try {
        const { geojson } = req.body;

        if (!geojson) {
            return res.status(400).json({ message: 'GeoJSON data is required' });
        }

        // 1. Get real claim statistics from MongoDB
        // In a real geospatial query, we would filter claims WITHIN this polygon.
        // For now, we'll fetch global stats to simulate the "region" context, 
        // or if we had geospatial indexing set up, we'd use $geoWithin.

        const totalClaims = await Claim.countDocuments();
        const pending = await Claim.countDocuments({ status: 'Submitted' });
        const verified = await Claim.countDocuments({ status: 'Verified' });
        const approved = await Claim.countDocuments({ status: 'Approved' });
        const rejected = await Claim.countDocuments({ status: 'Rejected' });

        const claimStats = {
            pending,
            verified,
            approved,
            rejected
        };

        // 2. Call Gemini Atlas Service
        const analysis = await analyzeRegion(geojson, totalClaims, claimStats);

        res.json(analysis);

    } catch (error) {
        console.error('Atlas Controller Error:', error);
        res.status(500).json({ message: 'Failed to analyze region' });
    }
};
