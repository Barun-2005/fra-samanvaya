const Claim = require('../models/Claim');
const { validateClaimSubmission } = require('../services/conflictDetector');
const { sendStatusUpdate, notifyOfficerNewClaim } = require('../services/notificationService');

// Get aggregated statistics for claims
exports.getClaimStats = async (req, res) => {
  try {
    const { state, district } = req.query;
    const query = {};
    if (state) query.state = state;
    if (district) query.district = district;

    const total = await Claim.countDocuments(query);
    const pending = await Claim.countDocuments({ ...query, status: 'Pending' });
    const underVerification = await Claim.countDocuments({ ...query, status: 'Under Verification' });
    const approved = await Claim.countDocuments({ ...query, status: 'Approved' });
    const rejected = await Claim.countDocuments({ ...query, status: 'Rejected' });

    // This assumes req.user is available from requireAuth middleware
    const assignedToMe = await Claim.countDocuments({ ...query, assignedTo: req.user.id });

    res.json({ total, pending, underVerification, approved, rejected, assignedToMe });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
};

// Get all claims with filtering, sorting, pagination, and search
exports.getAllClaims = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort,
      state,
      district,
      assignedTo,
      status,
      search
    } = req.query;

    const query = {};

    // Role-based filtering: Citizens see only their claims
    if (req.user?.roles.includes('Citizen')) {
      query.claimant = req.user.id;
    }

    // Apply filters
    if (state) query.state = state;
    if (district) query.district = district;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;

    // Search functionality
    if (search) {
      query.$or = [
        { claimantName: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { aadhaarNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    if (sort === 'latest') {
      sortOptions.updatedAt = -1;
    } else {
      sortOptions.createdAt = -1; // Default sort
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const total = await Claim.countDocuments(query);

    // Fetch claims with pagination
    const claims = await Claim.find(query)
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .populate('claimant', 'fullName email')
      .populate('verifiedBy', 'fullName')
      .populate('approvedBy', 'fullName');

    // Return with pagination metadata
    res.json({
      data: claims,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + claims.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ message: 'Server error while fetching claims' });
  }
};

exports.getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('documents');
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createClaim = async (req, res) => {
  try {
    const { geojson, scheme, claimant } = req.body;

    // PHASE 4: Conflict detection
    const conflictCheck = await validateClaimSubmission(geojson);

    // Create claim with conflict warning
    const newClaim = new Claim({
      ...req.body,
      claimant: req.user.id,
      status: conflictCheck.allowed ? 'Draft' : 'ConflictDetected'
    });

    const savedClaim = await newClaim.save();

    // Return with conflict information
    res.status(201).json({
      claim: savedClaim,
      conflictCheck: {
        conflicts: conflictCheck.conflicts,
        severity: conflictCheck.severity,
        message: conflictCheck.message,
        canProceed: conflictCheck.allowed
      }
    });
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(400).json({ message: 'Error creating claim', error: error.message });
  }
};

// Update a claim (Citizen)
exports.updateClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Authorization check
    if (req.user.roles.includes('Citizen') && claim.claimant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this claim' });
    }

    // Status check
    if (!['Submitted', 'Rejected', 'Draft'].includes(claim.status)) {
      return res.status(400).json({ message: 'Cannot update claim in current status' });
    }

    // Apply updates
    const allowedUpdates = ['claimantName', 'aadhaarNumber', 'village', 'landSizeClaimed', 'surveyNumber', 'claimType', 'reasonForClaim', 'remarks', 'geojson', 'boundaryArea', 'draftOrder'];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        claim[field] = updates[field];
      }
    });

    // Reset status if it was Rejected
    if (claim.status === 'Rejected') {
      claim.status = 'Submitted';
      claim.rejectionReason = undefined; // Clear rejection reason

      claim.statusHistory.push({
        status: 'Submitted',
        changedBy: req.user.id,
        changedAt: new Date(),
        reason: 'Claim updated and resubmitted'
      });
    } else if (updates.status) {
      // If status is explicitly passed (e.g. keeping it Submitted)
      claim.status = updates.status;
    }

    await claim.save();
    res.json(claim);

  } catch (error) {
    console.error('Update claim error:', error);
    res.status(500).json({ message: 'Error updating claim', error: error.message });
  }
};

// Verify a claim (Verification Officer or Field Worker via Satark)
exports.verifyClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, verificationReport } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // If it's a Satark Field Report
    if (verificationReport) {
      const satarkTools = require('../ai/tools/satarkTools');
      const fs = require('fs');
      const path = require('path');

      // 1. Save Photo
      let sitePhotoUrl = '';
      if (verificationReport.sitePhotoBase64) {
        const base64Data = verificationReport.sitePhotoBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `site-visit-${id}-${Date.now()}.jpg`;
        const uploadDir = path.join(__dirname, '../../uploads'); // Ensure this exists
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        fs.writeFileSync(path.join(uploadDir, fileName), buffer);
        sitePhotoUrl = `/uploads/${fileName}`;
      }

      // 2. Trigger Satark Analysis
      // We need a satellite photo URL. For now, we'll mock it or use a placeholder if not in claim.
      // In a real app, we'd fetch it from Google Maps Static API using claim.boundaryArea or location.
      const satellitePhotoUrl = "https://maps.googleapis.com/maps/api/staticmap?center=" +
        (verificationReport.location?.lat || 0) + "," + (verificationReport.location?.lng || 0) +
        "&zoom=18&size=600x300&maptype=satellite&key=" + process.env.GOOGLE_MAPS_API_KEY;

      let aiAnalysis = "Pending Analysis";
      let matchScore = 0;

      try {
        // Pass buffer directly to Satark
        const buffer = verificationReport.sitePhotoBase64 ? Buffer.from(verificationReport.sitePhotoBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64') : null;
        if (buffer) {
          const analysisResult = await satarkTools.analyzeEvidence(buffer, satellitePhotoUrl);
          aiAnalysis = analysisResult.analysis || "Analysis Failed";
          matchScore = analysisResult.matchScore || 0;
        }
      } catch (err) {
        console.error("Satark Analysis Error:", err);
        aiAnalysis = "AI Analysis Failed: " + err.message;
      }

      // 3. Update Claim with Report
      claim.verificationReport = {
        fieldWorkerId: req.user.id,
        sitePhotoUrl: sitePhotoUrl,
        satelliteSnapshotUrl: satellitePhotoUrl,
        aiAnalysis: aiAnalysis,
        matchScore: matchScore,
        timestamp: verificationReport.timestamp || new Date(),
        syncStatus: 'Synced',
        location: verificationReport.location
      };

      // Auto-update status if match score is high? Or just leave it for Verification Officer?
      // Let's keep status as 'Submitted' or move to 'Under Verification' if not already.
      // But the prompt says "Verify a claim".
      // If this comes from Field Worker, maybe we don't mark as 'Verified' yet, just attach report.
      // But the route is /verify.
      // Let's add a note to history.
      claim.statusHistory.push({
        status: claim.status, // Keep current status
        changedBy: req.user.id,
        changedAt: new Date(),
        reason: 'Field Verification Report Submitted'
      });

      await claim.save();
      return res.json({ message: 'Field Report Synced & Analyzed', claim });
    }

    // Standard Verification Officer Flow (Manual Approval)
    if (claim.status !== 'Submitted' && claim.status !== 'Under Verification') {
      return res.status(400).json({ message: 'Only submitted claims can be verified' });
    }

    // Update claim with verification details
    claim.status = 'Verified';
    claim.verifiedBy = req.user.id;
    claim.verifiedAt = new Date();
    claim.verificationNotes = notes || '';

    // Add to audit trail
    claim.statusHistory.push({
      status: 'Verified',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: notes || 'Claim verified by officer'
    });

    await claim.save();

    // Send notification to claimant
    await sendStatusUpdate(claim.claimant, claim._id, 'Verified');

    res.json({ message: 'Claim verified successfully', claim });
  } catch (error) {
    console.error('Verify claim error:', error);
    res.status(500).json({ message: 'Error verifying claim', error: error.message });
  }
};

// Approve a claim (Approving Authority)
exports.approveClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (claim.status !== 'Verified') {
      return res.status(400).json({ message: 'Only verified claims can be approved' });
    }

    // Update claim with approval details
    claim.status = 'Approved';
    claim.approvedBy = req.user.id;
    claim.approvedAt = new Date();
    claim.approvalNotes = notes || '';

    // Add to audit trail
    claim.statusHistory.push({
      status: 'Approved',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: notes || 'Claim approved'
    });

    await claim.save();

    // Send notification to claimant
    await sendStatusUpdate(claim.claimant, claim._id, 'Approved');

    res.json({ message: 'Claim approved successfully', claim });
  } catch (error) {
    console.error('Approve claim error:', error);
    res.status(500).json({ message: 'Error approving claim', error: error.message });
  }
};

// Reject a claim (Verification Officer or Approving Authority)
exports.rejectClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Update claim with rejection details
    claim.status = 'Rejected';
    claim.rejectionReason = reason;

    // Add to audit trail
    claim.statusHistory.push({
      status: 'Rejected',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: reason
    });

    await claim.save();

    // Send notification to claimant
    await sendStatusUpdate(claim.claimant, claim._id, 'Rejected');

    res.json({ message: 'Claim rejected', claim });
  } catch (error) {
    console.error('Reject claim error:', error);
    res.status(500).json({ message: 'Error rejecting claim', error: error.message });
  }
};
// Find similar approved claims (Precedents) - NOW WITH VECTOR SEARCH
exports.findSimilarClaims = async (req, res) => {
  try {
    const { text } = req.query; // Expecting 'text' query param for vector search

    if (!text) {
      // Fallback to old regex search if no text provided
      const { village, district, claimType } = req.query;
      if (!village && !district) {
        return res.status(400).json({ message: 'Text or Village/District is required' });
      }
      const query = {
        status: 'Approved',
        _id: { $ne: req.params.id }
      };
      if (village) query.village = { $regex: village, $options: 'i' };
      if (district) query.district = { $regex: district, $options: 'i' };
      if (claimType) query.claimType = claimType;

      const similarClaims = await Claim.find(query)
        .select('claimantName village landSizeClaimed approvedAt claimType reasonForClaim')
        .sort({ approvedAt: -1 })
        .limit(5);
      return res.json(similarClaims);
    }

    // Use Vector Search
    const { findSimilarClaims } = require('../services/ragService');
    const similarClaims = await findSimilarClaims(text);

    res.json(similarClaims);

  } catch (error) {
    console.error('Find similar claims error:', error);
    res.status(500).json({ message: 'Error finding similar claims' });
  }
};
// Get Risk Analysis & Draft Patta
exports.getClaimRisk = async (req, res) => {
  try {
    const { analyzeRisk, generatePatta } = require('../services/riskEngine');
    const claim = await Claim.findById(req.params.id);

    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const riskAnalysis = await analyzeRisk(claim);

    // Only generate Patta if approved or verified (to save tokens)
    let draftPatta = null;
    if (['Verified', 'Approved'].includes(claim.status)) {
      draftPatta = await generatePatta(claim);
    }

    res.json({ riskAnalysis, draftPatta });
  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({ message: 'Error analyzing risk' });
  }
};

// ============================================
// PHASE 5: STATUTORY COMPLIANCE FUNCTIONS
// ============================================

/**
 * Remand a claim back to Gram Sabha (SDLC Duty)
 * This is legally required before rejection in most cases
 */
exports.remandClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, targetStage } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Remand reason is required' });
    }

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Only SDLC_Scrutiny or Approved claims can be remanded
    if (!['SDLC_Scrutiny', 'Verified', 'InVerification'].includes(claim.status)) {
      return res.status(400).json({
        message: 'Only claims under scrutiny can be remanded',
        currentStatus: claim.status
      });
    }

    const previousStage = claim.status;

    // Add to remand history
    claim.remandHistory = claim.remandHistory || [];
    claim.remandHistory.push({
      date: new Date(),
      reason: reason,
      remandedBy: req.user.id,
      fromStage: previousStage,
      toStage: targetStage || 'GramSabhaApproved'
    });

    // Update status
    claim.status = 'Remanded';

    // Add to audit trail
    claim.statusHistory.push({
      status: 'Remanded',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: `Remanded: ${reason}`
    });

    await claim.save();

    // Send notification to claimant
    await sendStatusUpdate(claim.claimant, claim._id, 'Remanded');

    res.json({
      message: 'Claim remanded to Gram Sabha',
      claim,
      remandDetails: claim.remandHistory[claim.remandHistory.length - 1]
    });
  } catch (error) {
    console.error('Remand claim error:', error);
    res.status(500).json({ message: 'Error remanding claim', error: error.message });
  }
};

/**
 * Get AI-suggested remand reason from Vidhi
 */
exports.getRemandSuggestion = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('documents');
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are Vidhi, the legal governance AI for FRA (Forest Rights Act) claims.
    Analyze this claim and suggest specific reasons why it might need to be remanded to the Gram Sabha for additional evidence.
    
    Claim Details:
    - Claimant: ${claim.claimantName}
    - Village: ${claim.village}
    - Land Size: ${claim.landSizeClaimed} hectares
    - Claim Type: ${claim.claimType}
    - Reason for Claim: ${claim.reasonForClaim}
    - Documents Count: ${claim.documents?.length || 0}
    - Gram Sabha Resolution: ${claim.gramSabhaResolution?.resolutionNumber || 'Missing'}
    - Joint Verification: ${claim.verificationReport?.forestOfficerSignature ? 'Complete' : 'Incomplete'}
    
    Provide exactly 3 potential remand reasons in JSON format:
    [
      { "reason": "Specific legal reason", "evidence_needed": "What Gram Sabha should provide" }
    ]
    Return only JSON, no markdown.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let suggestions;
    try {
      suggestions = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      suggestions = [{ reason: 'Additional Gram Sabha verification required', evidence_needed: 'Updated resolution' }];
    }

    res.json({ suggestions, source: 'Vidhi AI' });
  } catch (error) {
    console.error('Remand suggestion error:', error);
    res.status(500).json({ message: 'Error getting suggestions', error: error.message });
  }
};

/**
 * Gram Sabha Resolution Approval
 * Required before claim can proceed to Field Verification
 */
exports.gramSabhaApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNumber, resolutionDate, quorumMet, frcMemberCount, documentUrl } = req.body;

    if (!resolutionNumber || !resolutionDate) {
      return res.status(400).json({ message: 'Resolution number and date are required' });
    }

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Can only update Submitted or Remanded claims
    if (!['Submitted', 'Remanded'].includes(claim.status)) {
      return res.status(400).json({
        message: 'Gram Sabha approval only valid for Submitted or Remanded claims',
        currentStatus: claim.status
      });
    }

    // Update Gram Sabha Resolution
    claim.gramSabhaResolution = {
      date: new Date(resolutionDate),
      resolutionNumber: resolutionNumber,
      documentUrl: documentUrl || claim.gramSabhaResolution?.documentUrl,
      quorumMet: quorumMet !== undefined ? quorumMet : true,
      frcMemberCount: frcMemberCount || 0,
      approvedBy: req.user.id
    };

    // Update status
    claim.status = 'GramSabhaApproved';

    // Add to audit trail
    claim.statusHistory.push({
      status: 'GramSabhaApproved',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: `Gram Sabha Resolution ${resolutionNumber} dated ${resolutionDate}`
    });

    await claim.save();

    // Send notification to claimant
    await sendStatusUpdate(claim.claimant, claim._id, 'GramSabhaApproved');

    res.json({
      message: 'Gram Sabha resolution recorded',
      claim,
      nextStep: 'Claim is now ready for Joint Verification by Field Worker'
    });
  } catch (error) {
    console.error('Gram Sabha approve error:', error);
    res.status(500).json({ message: 'Error recording Gram Sabha resolution', error: error.message });
  }
};

/**
 * Joint Verification by Forest + Revenue Officials
 * Both signatures required before SDLC scrutiny
 */
exports.jointVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      forestOfficerName, forestOfficerDesignation, forestOfficerSignature,
      revenueInspectorName, revenueInspectorDesignation, revenueInspectorSignature,
      sitePhotoBase64, location, notes
    } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Must have Gram Sabha approval first
    if (claim.status !== 'GramSabhaApproved') {
      return res.status(400).json({
        message: 'Gram Sabha approval required before Joint Verification',
        currentStatus: claim.status
      });
    }

    // Initialize verification report if not exists
    if (!claim.verificationReport) {
      claim.verificationReport = {};
    }

    // Update Forest Officer details
    if (forestOfficerName) {
      claim.verificationReport.forestOfficerName = forestOfficerName;
      claim.verificationReport.forestOfficerDesignation = forestOfficerDesignation;
      claim.verificationReport.forestOfficerSignature = forestOfficerSignature || false;
      claim.verificationReport.forestOfficerId = req.user.id;
    }

    // Update Revenue Inspector details
    if (revenueInspectorName) {
      claim.verificationReport.revenueInspectorName = revenueInspectorName;
      claim.verificationReport.revenueInspectorDesignation = revenueInspectorDesignation;
      claim.verificationReport.revenueInspectorSignature = revenueInspectorSignature || false;
      claim.verificationReport.revenueInspectorId = req.user.id;
    }

    // Update location and photo
    if (location) {
      claim.verificationReport.location = location;
    }
    claim.verificationReport.timestamp = new Date();
    claim.verificationReport.fieldWorkerId = req.user.id;

    // Handle site photo
    if (sitePhotoBase64) {
      const fs = require('fs');
      const path = require('path');
      const base64Data = sitePhotoBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `joint-verify-${id}-${Date.now()}.jpg`;
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      claim.verificationReport.sitePhotoUrl = `/uploads/${fileName}`;

      // Trigger Satark AI analysis
      try {
        const satarkTools = require('../ai/tools/satarkTools');
        const analysisResult = await satarkTools.analyzeEvidence(buffer, null);
        claim.verificationReport.aiAnalysis = analysisResult.analysis || 'Analysis pending';
        claim.verificationReport.matchScore = analysisResult.matchScore || 0;
        claim.verificationReport.satarkRecommendation =
          analysisResult.matchScore > 70 ? 'Approve' :
            analysisResult.matchScore > 40 ? 'NeedsReview' : 'Reject';
      } catch (err) {
        console.error('Satark analysis error:', err);
        claim.verificationReport.aiAnalysis = 'AI analysis unavailable';
      }
    }

    // Check if both signatures are present
    const isComplete = claim.verificationReport.forestOfficerSignature &&
      claim.verificationReport.revenueInspectorSignature;

    if (isComplete) {
      claim.status = 'FieldVerified';
      claim.statusHistory.push({
        status: 'FieldVerified',
        changedBy: req.user.id,
        changedAt: new Date(),
        reason: 'Joint Verification completed by Forest and Revenue officials'
      });
    }

    claim.verificationReport.syncStatus = 'Synced';
    await claim.save();

    res.json({
      message: isComplete ? 'Joint Verification Complete' : 'Verification details saved (awaiting second signature)',
      claim,
      verificationComplete: isComplete,
      nextStep: isComplete ? 'Claim ready for SDLC Scrutiny' : 'Awaiting second official signature'
    });
  } catch (error) {
    console.error('Joint verify error:', error);
    res.status(500).json({ message: 'Error in joint verification', error: error.message });
  }
};

/**
 * Move claim to SDLC Scrutiny
 */
exports.moveToSDLC = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (claim.status !== 'FieldVerified') {
      return res.status(400).json({
        message: 'Only FieldVerified claims can be moved to SDLC',
        currentStatus: claim.status
      });
    }

    // Check if joint verification is complete
    if (!claim.isJointVerificationComplete || !claim.isJointVerificationComplete()) {
      return res.status(400).json({
        message: 'Joint Verification incomplete. Both Forest and Revenue signatures required.'
      });
    }

    claim.status = 'SDLC_Scrutiny';
    claim.statusHistory.push({
      status: 'SDLC_Scrutiny',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: 'Moved to SDLC for scrutiny'
    });

    await claim.save();
    res.json({ message: 'Claim moved to SDLC Scrutiny', claim });
  } catch (error) {
    console.error('Move to SDLC error:', error);
    res.status(500).json({ message: 'Error moving to SDLC', error: error.message });
  }
};

/**
 * Generate Title Deed (Form C) PDF
 */
exports.generateTitleDeed = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('claimant');
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (claim.status !== 'Approved') {
      return res.status(400).json({
        message: 'Title Deed can only be generated for Approved claims',
        currentStatus: claim.status
      });
    }

    const { generateTitleDeedPDF } = require('../services/pdfGenerator');
    const pdfResult = await generateTitleDeedPDF(claim);

    // Update claim with title deed info
    claim.titleDeed = {
      pdfUrl: pdfResult.pdfUrl,
      generatedAt: new Date(),
      generatedBy: req.user.id,
      serialNumber: pdfResult.serialNumber
    };
    claim.status = 'Title_Issued';

    claim.statusHistory.push({
      status: 'Title_Issued',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: `Title Deed ${pdfResult.serialNumber} generated`
    });

    await claim.save();

    // Send notification to claimant
    await sendStatusUpdate(claim.claimant, claim._id, 'Title_Issued');

    res.json({
      message: 'Title Deed generated successfully',
      pdfUrl: pdfResult.pdfUrl,
      serialNumber: pdfResult.serialNumber,
      claim
    });
  } catch (error) {
    console.error('Generate title deed error:', error);
    res.status(500).json({ message: 'Error generating title deed', error: error.message });
  }
};
