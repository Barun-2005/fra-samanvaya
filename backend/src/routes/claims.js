const express = require('express');
const router = express.Router();
const { getAllClaims, createClaim, getClaimById } = require('../controllers/claimController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, getAllClaims);
router.post('/', requireAuth, createClaim);
router.get('/:id', requireAuth, getClaimById);

module.exports = router;
