const express = require('express');
const router = express.Router();
const { getAllSchemes, recommendSchemes } = require('../controllers/schemeController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, getAllSchemes);
router.post('/recommend', requireAuth, recommendSchemes);

module.exports = router;
