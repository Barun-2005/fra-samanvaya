const Claim = require('../models/Claim');

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

// Get all claims with filtering and sorting
exports.getAllClaims = async (req, res) => {
  try {
    const { limit = 6, sort, state, district, assignedTo } = req.query;
    const query = {};
    if (state) query.state = state;
    if (district) query.district = district;
    if (assignedTo) query.assignedTo = assignedTo;

    const sortOptions = {};
    if (sort === 'latest') {
      sortOptions.updatedAt = -1;
    }

    const claims = await Claim.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit, 10));
      
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching claims' });
  }
};

exports.getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
    }
    res.json(claim);
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};

exports.createClaim = async (req, res) => {
    // Basic implementation
    try {
        const newClaim = new Claim({
            ...req.body,
            createdBy: req.user.id,
        });
        const savedClaim = await newClaim.save();
        res.status(201).json(savedClaim);
    } catch (error) {
        res.status(400).json({ message: 'Error creating claim', error });
    }
};
