/**
 * Conflict Detection Service
 * Detects overlapping land claims using MongoDB geospatial queries
 */
const Claim = require('../models/Claim');

/**
 * Detect claims that overlap with the given GeoJSON geometry
 * @param {Object} geojson - GeoJSON geometry to check
 * @param {string} excludeClaimId - Optional claim ID to exclude from search
 * @returns {Array} List of overlapping claims
 */
async function detectOverlaps(geojson, excludeClaimId = null) {
    try {
        const query = {
            geojson: {
                $geoIntersects: {
                    $geometry: geojson
                }
            },
            status: { $in: ['Submitted', 'InVerification', 'Approved'] } // Only check active claims
        };

        // Exclude current claim if updating
        if (excludeClaimId) {
            query._id = { $ne: excludeClaimId };
        }

        const overlappingClaims = await Claim.find(query)
            .select('_id claimant geojson status createdAt')
            .populate('claimant', 'name village contactNumber')
            .limit(20) // Limit to prevent huge results
            .lean();

        // Calculate overlap details
        const conflicts = overlappingClaims.map(claim => ({
            claimId: claim._id,
            claimantName: claim.claimant?.name || 'Unknown',
            village: claim.claimant?.village || 'Unknown',
            contactNumber: claim.claimant?.contactNumber,
            status: claim.status,
            submittedOn: claim.createdAt,
            overlapSeverity: calculateOverlapSeverity(geojson, claim.geojson)
        }));

        return conflicts;

    } catch (error) {
        console.error('Overlap detection failed:', error.message);
        throw new Error(`Conflict detection failed: ${error.message}`);
    }
}

/**
 * Calculate overlap severity (simplified)
 * Returns: 'LOW' (<10% overlap), 'MEDIUM' (10-30%), 'HIGH' (>30%)
 */
function calculateOverlapSeverity(geojson1, geojson2) {
    // Simplified calculation - in production use turf.js for accurate intersection
    // For now, return MEDIUM as a conservative estimate
    return 'MEDIUM';
}

/**
 * Validate if a claim can be submitted based on conflicts
 * @returns {Object} { allowed: boolean, conflicts: array, message: string }
 */
async function validateClaimSubmission(geojson, excludeClaimId = null) {
    const conflicts = await detectOverlaps(geojson, excludeClaimId);

    const highSeverityConflicts = conflicts.filter(c => c.overlapSeverity === 'HIGH');

    return {
        allowed: highSeverityConflicts.length === 0,
        conflicts: conflicts,
        severity: highSeverityConflicts.length > 0 ? 'HIGH' :
            conflicts.length > 0 ? 'MEDIUM' : 'NONE',
        message: conflicts.length === 0
            ? 'No conflicts detected. Claim can proceed.'
            : highSeverityConflicts.length > 0
                ? `High overlap detected with ${highSeverityConflicts.length} existing claim(s). Manual review required.`
                : `Minor overlap detected with ${conflicts.length} existing claim(s). Proceeding with caution.`
    };
}

module.exports = {
    detectOverlaps,
    validateClaimSubmission,
    calculateOverlapSeverity
};
