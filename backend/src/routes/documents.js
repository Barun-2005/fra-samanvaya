const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDocument } = require('../controllers/documentController');
const { requireAuth } = require('../middlewares/authMiddleware');

const upload = multer({ dest: process.env.UPLOADS_DIR || 'uploads/' });

router.post('/upload', requireAuth, upload.single('document'), uploadDocument);

module.exports = router;
