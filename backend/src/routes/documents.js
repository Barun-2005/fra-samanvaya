const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/documentController');
const { extractClaimData } = require('../services/geminiOCR');
const { requireAuth } = require('../middlewares/authMiddleware');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// OCR Extraction endpoint for SmartUploadForm
router.post('/extract', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Read file buffer
        const fileBuffer = fs.readFileSync(req.file.path);

        // Extract data using Gemini OCR
        const extractedData = await extractClaimData(fileBuffer, req.file.mimetype);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            extractedData: extractedData
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

router.post('/upload', requireAuth, upload.single('document'), documentController.uploadDocument);

module.exports = router;

