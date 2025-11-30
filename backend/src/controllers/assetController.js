const Asset = require('../models/Asset');
const Claim = require('../models/Claim');
const { analyzeSatelliteImage, analyzeByCoordinates, calculatePolygonArea } = require('../services/assetService');
const fs = require('fs');

/**
 * Analyze asset using Gemini satellite image analysis
 */
exports.analyzeAsset = async (req, res) => {
  const { claimId, polygon, userClaim, claimedArea } = req.body;
  const { file } = req; // Optional satellite image

  if (!claimId || !polygon) {
    return res.status(400).json({ message: 'Missing claimId or polygon' });
  }

  try {
    // Calculate bbox from polygon
    const coords = polygon.coordinates[0];
    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    const bbox = [
      Math.min(...lons),
      Math.min(...lats),
      Math.max(...lons),
      Math.max(...lats)
    ];

    // Create asset record
    const asset = new Asset({
      claim: claimId,
      requester: req.user.id,
      polygon: polygon,
      snapshotImage: file ? file.path : null,
      status: 'Processing',
    });

    await asset.save();

    let analysisResult;

    if (file && file.path) {
      // WITH satellite image - High accuracy
      const imageBuffer = fs.readFileSync(file.path);
      const mimeType = file.mimetype;

      analysisResult = await analyzeSatelliteImage(
        imageBuffer,
        mimeType,
        userClaim || { type: 'Farmland' },
        claimedArea || calculatePolygonArea(polygon)
      );
    } else {
      // WITHOUT satellite image - Conservative estimate
      analysisResult = await analyzeByCoordinates(
        polygon,
        bbox,
        userClaim || { type: 'Farmland' },
        claimedArea || calculatePolygonArea(polygon)
      );
    }

    // Update asset with results
    asset.status = 'Completed';
    asset.result = {
      ...analysisResult.landAreasHa,
      veracityScore: analysisResult.veracityScore,
      veracityLevel: analysisResult.veracityLevel,
      landCoverPercentages: analysisResult.landCover,
      aiAssessment: analysisResult.aiAssessment,
      warnings: analysisResult.warnings || [],
      confidence: analysisResult.confidence,
      modelVersion: analysisResult.processor
    };
    await asset.save();

    // Update claim with asset summary
    await Claim.findByIdAndUpdate(claimId, {
      assetSummary: asset.result,
      veracityScore: analysisResult.veracityScore,
      veracityLevel: analysisResult.veracityLevel
    });

    res.status(201).json({
      asset: asset,
      analysis: {
        landCover: analysisResult.landCover,
        landAreasHa: analysisResult.landAreasHa,
        veracityScore: analysisResult.veracityScore,
        veracityLevel: analysisResult.veracityLevel,
        aiAssessment: analysisResult.aiAssessment,
        warnings: analysisResult.warnings,
        confidence: analysisResult.confidence
      },
      message: file
        ? 'Satellite image analyzed successfully'
        : 'Analysis based on coordinates (upload satellite image for better accuracy)'
    });
  } catch (error) {
    console.error('Asset analysis error:', error);

    // Update asset status to failed
    const asset = await Asset.findOne({ claim: claimId }).sort({ createdAt: -1 });
    if (asset) {
      asset.status = 'Failed';
      await asset.save();
    }

    res.status(500).json({
      message: 'Asset analysis failed',
      error: error.message
    });
  }
};

/**
 * Get asset analysis results for a claim
 */
exports.getAssetAnalysis = async (req, res) => {
  try {
    const { claimId } = req.params;

    const asset = await Asset.findOne({ claim: claimId, status: 'Completed' })
      .sort({ createdAt: -1 });

    if (!asset) {
      return res.status(404).json({ message: 'No completed analysis found for this claim' });
    }

    res.json({
      asset: asset,
      veracityScore: asset.result.veracityScore,
      veracityLevel: asset.result.veracityLevel,
      aiAssessment: asset.result.aiAssessment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis', error: error.message });
  }
};
