const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, schemeController.getAllSchemes);
router.post('/', requireAuth, schemeController.createScheme);
router.get('/recommend/:claimId', requireAuth, schemeController.getRecommendations);
router.post('/recommend', requireAuth, schemeController.getRecommendationsFromProfile);
router.post('/match', requireAuth, schemeController.matchSchemesForVillage);

module.exports = router;
