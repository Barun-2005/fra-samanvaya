const express = require('express');
const router = express.Router();
const { getAllSchemes } = require('../controllers/schemeController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, getAllSchemes);

module.exports = router;
