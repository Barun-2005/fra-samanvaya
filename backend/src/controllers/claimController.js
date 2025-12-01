const Claim = require('../models/Claim');
const { validateClaimSubmission } = require('../services/conflictDetector');

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
    const allowedUpdates = ['claimantName', 'aadhaarNumber', 'village', 'landSizeClaimed', 'surveyNumber', 'claimType', 'reasonForClaim', 'remarks', 'geojson', 'boundaryArea'];

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

// Verify a claim (Verification Officer)
exports.verifyClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (claim.status !== 'Submitted') {
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

    res.json({ message: 'Claim rejected', claim });
  } catch (error) {
    console.error('Reject claim error:', error);
    res.status(500).json({ message: 'Error rejecting claim', error: error.message });
  }
};
// Find similar approved claims (Precedents)
exports.findSimilarClaims = async (req, res) => {
  try {
    const { village, district, claimType } = req.query;

    if (!village && !district) {
      return res.status(400).json({ message: 'Village or District is required' });
    }

    const query = {
      status: 'Approved',
      _id: { $ne: req.params.id } // Exclude current claim if ID is passed
    };

    if (village) query.village = { $regex: village, $options: 'i' };
    if (district) query.district = { $regex: district, $options: 'i' };
    if (claimType) query.claimType = claimType;

    const similarClaims = await Claim.find(query)
      .select('claimantName village landSizeClaimed approvedAt claimType')
      .sort({ approvedAt: -1 })
      .limit(5);

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
