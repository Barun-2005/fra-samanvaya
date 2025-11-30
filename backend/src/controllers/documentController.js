const Document = require('../models/Document');
const { extractClaimData } = require('../services/geminiOCR');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
  const { claimId } = req.body;
  const file = req.file; // Fix: req.file is direct property, not nested

  if (!file || !claimId) {
    return res.status(400).json({ message: 'Missing file or claimId' });
  }

  try {
    // Read file buffer for Gemini
    const fileBuffer = fs.readFileSync(file.path);

    // Extract data using Gemini OCR
    const extractedData = await extractClaimData(fileBuffer, file.mimetype);

    const document = new Document({
      claim: claimId,
      uploader: req.user.id,
      fileRef: file.path,
      extractedData: extractedData, // Store structured JSON
      ocrText: JSON.stringify(extractedData), // Legacy field for compatibility
      ocrConfidence: extractedData.confidence || 0.8,
    });

    await document.save();

    res.status(201).json({
      message: 'Document processed successfully',
      document: document,
      extractedData: extractedData
    });
  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({ message: 'Error processing document', error: error.message });
  }
};

exports.extractDataOnly = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Missing file' });
  }

  try {
    // Read file buffer for Gemini
    const fileBuffer = fs.readFileSync(file.path);

    // Extract data using Gemini OCR
    const extractedData = await extractClaimData(fileBuffer, file.mimetype);

    // We don't save to DB here, just return the data
    // Clean up the uploaded file since we're not saving it yet
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.warn('Failed to delete temp file:', e);
    }

    res.status(200).json({
      message: 'Data extracted successfully',
      extractedData: extractedData
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ message: 'Error extracting data', error: error.message });
  }
};
