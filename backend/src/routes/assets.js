const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeAsset } = require('../controllers/assetController');
const { requireAuth } = require('../middlewares/authMiddleware');

const upload = multer({ dest: process.env.UPLOADS_DIR || 'uploads/' });

// Route to handle asset analysis, expects multipart/form-data
router.post('/analyze', requireAuth, upload.single('snapshot'), analyzeAsset);

module.exports = router;
