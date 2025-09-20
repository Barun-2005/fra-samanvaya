const express = require('express');
const router = express.Router();
const {
  getAllClaims,
  createClaim,
  getClaimById,
  getClaimStats,
} = require('../controllers/claimController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/stats', requireAuth, getClaimStats);
router.get('/', requireAuth, getAllClaims);
router.post('/', requireAuth, createClaim);
router.get('/:id', requireAuth, getClaimById);

module.exports = router;
