const Document = require('../models/Document');
const ocrMock = require('../mocks/ocrMock');

exports.uploadDocument = async (req, res) => {
  const { claimId } = req.body;
  const { file } = req;

  if (!file || !claimId) {
    return res.status(400).json({ message: 'Missing file or claimId' });
  }

  try {
    let ocrResult = {};
    if (process.env.USE_MOCKS === 'true') {
      ocrResult = await ocrMock(file.path);
    } else {
      // TODO: Implement actual OCR service call
      ocrResult = await ocrMock(file.path); // Default to mock
    }

    const document = new Document({
      claim: claimId,
      uploader: req.user.id,
      fileRef: file.path,
      ocrText: ocrResult.text,
      ocrConfidence: ocrResult.confidence,
    });

    await document.save();

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};
