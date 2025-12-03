const Document = require('../models/Document');
const { processDocument } = require('../services/documentProcessor');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
  const { claimId } = req.body;
  const file = req.file;

  if (!file || !claimId) {
    return res.status(400).json({ message: 'Missing file or claimId' });
  }

  try {
    // Run the "One-Up" Document Intelligence Pipeline
    const { fingerprint, cleanBuffer, extractionResult } = await processDocument(file);

    const document = new Document({
      claim: claimId,
      uploader: req.user.id,
      fileRef: file.path,

      // Tier 2: Duplicate Detection
      fileFingerprint: fingerprint,

      // Tier 3: Smart Extraction
      metadata: extractionResult,
      anomalies: extractionResult.anomalies || [],

      // Legacy fields for compatibility
      ocrText: JSON.stringify(extractionResult.extractedData),
      ocrConfidence: extractionResult.confidence || 0.8,
    });

    await document.save();

    res.status(201).json({
      message: 'Document processed successfully',
      document: document,
      extractedData: extractionResult.extractedData,
      anomalies: extractionResult.anomalies
    });

  } catch (error) {
    console.error('Document processing error:', error);

    // Handle Duplicate Document Error
    if (error.code === 'DUPLICATE_DOCUMENT') {
      return res.status(409).json({
        message: 'Duplicate Document Detected',
        existingDocId: error.existingDocId
      });
    }

    res.status(500).json({ message: 'Error processing document', error: error.message });
  }
};

exports.extractDataOnly = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Missing file' });
  }

  try {
    const fs = require('fs');
    const rawBuffer = fs.readFileSync(file.path);

    // 1. Tier 1: Normalize
    const { preProcessImage, extractSmartData } = require('../services/documentProcessor');
    const cleanBuffer = await preProcessImage(rawBuffer);

    // 2. Tier 3: Extract
    const extractionResult = await extractSmartData(cleanBuffer, file.mimetype);

    // Clean up temp file
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.warn('Failed to delete temp file:', e);
    }

    res.status(200).json({
      message: 'Data extracted successfully',
      extractedData: extractionResult.extractedData,
      anomalies: extractionResult.anomalies
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ message: 'Error extracting data', error: error.message });
  }
};
