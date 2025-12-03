const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/documentController');
const { processDocument } = require('../services/documentProcessor');
const { requireAuth } = require('../middlewares/authMiddleware');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// OCR Extraction endpoint for SmartUploadForm
router.post('/extract', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Process document using the full pipeline (Normalize -> Fingerprint -> Extract)
        const result = await processDocument(req.file);

        // Clean up uploaded file
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) { console.error('Error deleting temp file:', e); }

        res.status(200).json({
            success: true,
            extractionResult: result.extractionResult
        });
    } catch (error) {
        console.error('OCR extraction error:', error);

        // Clean up file if it exists
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) { }
        }

        res.status(500).json({
            success: false,
            message: 'OCR extraction failed',
            error: error.message
        });
    }
});

// Alias for frontend compatibility (data-entry.js calls /upload)
router.post('/upload', upload.single('document'), async (req, res) => {
    // Redirect logic to extract
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const result = await processDocument(req.file);
        try { fs.unlinkSync(req.file.path); } catch (e) { }
        res.status(200).json({ success: true, extractionResult: result.extractionResult });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Protected upload for actual storage
router.post('/store', requireAuth, upload.single('document'), documentController.uploadDocument);

module.exports = router;

