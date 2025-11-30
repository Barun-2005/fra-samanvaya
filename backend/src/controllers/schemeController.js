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

        // Get claimant data from first document's extraction
        const claimantData = claim.documents[0]?.extractedData || {
            claimantName: 'Unknown',
            landSizeClaimed: 0
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

        res.status(200).json(recommendations);

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
eligibility: 'Forest dwelling scheduled tribes and traditional forest dwellers',
    benefit: 'Land title deed'
        },
{
    name: 'MGNREGA',
        description: 'Mahatma Gandhi National Rural Employment Guarantee Act',
            eligibility: 'Rural households',
                benefit: '100 days of wage employment'
},
{
    name: 'Kisan Credit Card',
        description: 'Agricultural credit for farmers',
            eligibility: 'Farmers with landholding',
                benefit: 'Low-interest agricultural credit'
}
    ];

res.status(200).json({ schemes });
};
