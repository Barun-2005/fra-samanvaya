const { recommendSchemes } = require('../services/geminiDSS');
const Claim = require('../models/Claim');

/**
 * Get scheme recommendations for a specific claim
 */
exports.getRecommendations = async (req, res) => {
    try {
        const { claimId } = req.params;

        // Fetch claim with populated documents
        const claim = await Claim.findById(claimId)
            .populate('documents')
            .lean();

        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        // Get claimant data from claim details (primary) or document extraction (fallback)
        const claimantData = {
            claimantName: claim.claimantName || claim.documents?.[0]?.extractedData?.claimantName || 'Unknown',
            landSizeClaimed: claim.landSizeClaimed || claim.documents?.[0]?.extractedData?.landSizeClaimed || 0,
            village: claim.village || claim.documents?.[0]?.extractedData?.village || 'Unknown',
            claimType: claim.claimType || 'Individual'
        };

        // Get asset analysis data
        const assetData = claim.assetSummary || {
            forestHa: 0,
            farmlandHa: 0,
            waterAreasHa: 0,
            homesteadCount: 0
        };

        // Get recommendations from Gemini DSS
        const recommendations = await recommendSchemes(claimantData, assetData);

        res.status(200).json(recommendations.schemes);

    } catch (error) {
        console.error('Scheme recommendation error:', error);
        res.status(500).json({
            message: 'Failed to generate recommendations',
            error: error.message
        });
    }
};

/**
 * Get all available schemes (static list)
 */
const Scheme = require('../models/Scheme');

/**
 * Get all available schemes
 */
exports.getAllSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find().sort({ createdAt: -1 });
        res.status(200).json({ schemes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schemes' });
    }
};

exports.createScheme = async (req, res) => {
    try {
        const scheme = new Scheme(req.body);
        await scheme.save();
        res.status(201).json(scheme);
    } catch (error) {
        res.status(500).json({ message: 'Error creating scheme', error: error.message });
    }
};

// AI Policy Matcher for Scheme Admins
exports.matchSchemesForVillage = async (req, res) => {
    try {
        const { matchSchemes } = require('../services/policyMatcher');
        const { village, district, approvedClaims, totalLand } = req.body;

        const recommendations = await matchSchemes({
            name: village,
            district,
            approvedClaims,
            totalLand
        });

        res.json(recommendations);
    } catch (error) {
        console.error('Policy matching error:', error);
        res.status(500).json({ message: 'Error matching schemes' });
    }
};
