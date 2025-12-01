const express = require('express');
const router = express.Router();
const atlasController = require('../controllers/atlasController');
const { requireAuth } = require('../middlewares/authMiddleware');

// POST /api/atlas/analyze-region
router.post('/analyze-region', requireAuth, atlasController.analyzeRegion);

module.exports = router;
