const Asset = require('../models/Asset');

// Mock function to simulate asset analysis
const mockAssetAnalysis = () => {
  return Promise.resolve({
    waterAreasHa: (Math.random() * 10).toFixed(2),
    farmlandHa: (Math.random() * 50).toFixed(2),
    forestHa: (Math.random() * 20).toFixed(2),
    homesteadCount: Math.floor(Math.random() * 5),
    modelVersion: 'mock-v1.0',
  });
};

exports.analyzeAsset = async (req, res) => {
  const { claimId, polygon, meta } = req.body;
  const { file } = req; // Optional snapshot image

  if (!claimId || !polygon || !meta) {
    return res.status(400).json({ message: 'Missing required fields: claimId, polygon, or meta.' });
  }

  try {
    const asset = new Asset({
      claim: claimId,
      requester: req.user.id, // Populated by auth middleware
      polygon: JSON.parse(polygon),
      snapshotImage: file ? file.path : null,
      meta: JSON.parse(meta),
      status: 'Queued',
    });

    await asset.save();

    let analysisResult;
    if (process.env.USE_MOCKS === 'true') {
      analysisResult = await mockAssetAnalysis();
    } else {
      console.log('Real asset service call is not yet implemented. Using mock data.');
      analysisResult = await mockAssetAnalysis();
    }

    asset.status = 'Completed';
    asset.result = analysisResult;
    await asset.save();

    res.status(201).json(asset);
  } catch (error) {
    console.error('Error analyzing asset:', error);
    res.status(500).json({ message: 'Error analyzing asset', error: error.message });
  }
};
