const Claim = require('../models/Claim');
const User = require('../models/User');

/**
 * Detect system-wide anomalies
 * @returns {Promise<Array>} List of anomalies
 */
exports.detectAnomalies = async () => {
    const anomalies = [];

    // 1. Velocity Check: Officers verifying too many claims too fast
    // Find users who verified > 10 claims in the last 24 hours (Mock threshold for demo)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const velocityStats = await Claim.aggregate([
        { $match: { verifiedAt: { $gte: oneDayAgo } } },
        { $group: { _id: "$verifiedBy", count: { $sum: 1 } } },
        { $match: { count: { $gt: 10 } } } // Threshold
    ]);

    for (const stat of velocityStats) {
        const user = await User.findById(stat._id);
        if (user) {
            anomalies.push({
                type: 'HIGH_VELOCITY',
                severity: 'HIGH',
                message: `Officer ${user.fullName} verified ${stat.count} claims in the last 24 hours.`,
                timestamp: new Date()
            });
        }
    }

    // 2. Bulk Rejection Check
    const rejectionStats = await Claim.aggregate([
        { $match: { status: 'Rejected', updatedAt: { $gte: oneDayAgo } } },
        { $group: { _id: "$district", count: { $sum: 1 } } },
        { $match: { count: { $gt: 5 } } }
    ]);

    for (const stat of rejectionStats) {
        anomalies.push({
            type: 'BULK_REJECTION',
            severity: 'MEDIUM',
            message: `Unusual spike in rejections in ${stat._id} district (${stat.count} rejections).`,
            timestamp: new Date()
        });
    }

    // 3. Ghost Beneficiaries (Same Aadhaar used multiple times)
    // Note: In a real app, we'd have a unique index, but for detection:
    const duplicateAadhaar = await Claim.aggregate([
        { $group: { _id: "$aadhaarNumber", count: { $sum: 1 }, claims: { $push: "$_id" } } },
        { $match: { count: { $gt: 1 } } }
    ]);

    for (const dup of duplicateAadhaar) {
        if (dup._id) { // Ignore nulls
            anomalies.push({
                type: 'DUPLICATE_IDENTITY',
                severity: 'CRITICAL',
                message: `Aadhaar ${dup._id} is linked to ${dup.count} different claims.`,
                timestamp: new Date()
            });
        }
    }

    return anomalies;
};
