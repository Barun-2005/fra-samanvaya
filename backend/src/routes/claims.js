const express = require('express');
const router = express.Router(); const claimController = require('../controllers/claimController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Get stats for dashboard with real aggregation
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const Claim = require('../models/Claim');

    // Get total count
    const totalClaims = await Claim.countDocuments();

    // Get counts by status
    const pending = await Claim.countDocuments({ status: 'Submitted' });
    const verified = await Claim.countDocuments({ status: 'Verified' });
    const approved = await Claim.countDocuments({ status: 'Approved' });
    const rejected = await Claim.countDocuments({ status: 'Rejected' });

    // Get recent activity (claims updated in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = await Claim.countDocuments({
      updatedAt: { $gte: sevenDaysAgo }
    });

    res.json({
      totalClaims,
      pending,
      verified,
      approved,
      rejected,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Check for conflicts with existing claims
router.post('/check-conflicts', requireAuth, async (req, res) => {
  try {
    const { validateClaimSubmission } = require('../services/conflictDetector');
    const result = await validateClaimSubmission(req.body.geojson);
    res.json(result);
  } catch (error) {
    console.error('Conflict check error:', error);
    res.status(500).json({ message: 'Conflict check failed' });
  }
});

router.get('/', requireAuth, claimController.getAllClaims);
router.post('/', requireAuth, claimController.createClaim);
router.get('/similar', requireAuth, claimController.findSimilarClaims);
router.get('/:id', requireAuth, claimController.getClaimById);
router.put('/:id', requireAuth, claimController.updateClaim);

// Workflow action routes
router.post('/:id/verify', requireAuth, claimController.verifyClaim);
router.post('/:id/approve', requireAuth, claimController.approveClaim);
router.post('/:id/reject', requireAuth, claimController.rejectClaim);
router.get('/:id/risk', requireAuth, claimController.getClaimRisk);

module.exports = router;


