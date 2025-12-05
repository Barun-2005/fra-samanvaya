const mongoose = require('mongoose');

// Valid status transitions (Legal Workflow)
const VALID_TRANSITIONS = {
  'Draft': ['Submitted'],
  'Submitted': ['GramSabhaApproved', 'Rejected'],
  'GramSabhaApproved': ['FieldVerified', 'Rejected'],
  'FieldVerified': ['SDLC_Scrutiny'],
  'SDLC_Scrutiny': ['Approved', 'Remanded', 'Rejected'],
  'Remanded': ['GramSabhaApproved'],
  'Approved': ['Title_Issued'],
  'Title_Issued': [],
  'Rejected': [],
  'ConflictDetected': ['Submitted', 'Rejected']
};

const claimSchema = new mongoose.Schema({
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: false },
  status: {
    type: String,
    enum: [
      'Draft',
      'Submitted',
      'GramSabhaApproved',  // After FRC passes resolution
      'FieldVerified',      // After Joint Verification
      'SDLC_Scrutiny',      // Under SDLC review
      'Approved',           // DLC approved
      'Remanded',           // Sent back to Gram Sabha
      'Rejected',
      'Title_Issued',       // Patta generated
      'ConflictDetected',
      // Legacy statuses for backward compatibility
      'InVerification',
      'Verified'
    ],
    default: 'Draft'
  },

  // Core Claim Details
  claimantName: { type: String },
  aadhaarNumber: { type: String },
  village: { type: String },
  district: { type: String },
  state: { type: String },
  landSizeClaimed: { type: Number },
  surveyNumber: { type: String },
  claimType: { type: String, enum: ['Individual', 'Community'], default: 'Individual' },
  reasonForClaim: { type: String },
  boundaryArea: { type: Number },
  geojson: {
    type: {
      type: String,
      enum: ['Polygon', 'Point'],
      required: true
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  villageCentroidFallback: { type: Boolean, default: false },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],

  // Gram Sabha Resolution (Form B) - STATUTORY REQUIREMENT
  gramSabhaResolution: {
    date: { type: Date },
    resolutionNumber: { type: String },
    documentUrl: { type: String },
    quorumMet: { type: Boolean, default: false },
    frcMemberCount: { type: Number },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // Verification tracking (Standard)
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  verificationNotes: { type: String },

  // Joint Verification Report - STATUTORY REQUIREMENT (Dual Signatures)
  verificationReport: {
    fieldWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Forest Department Official (Mandatory for Joint Verification)
    forestOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    forestOfficerName: { type: String },
    forestOfficerDesignation: { type: String },
    forestOfficerSignature: { type: Boolean, default: false },
    // Revenue Department Official (Mandatory for Joint Verification)
    revenueInspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    revenueInspectorName: { type: String },
    revenueInspectorDesignation: { type: String },
    revenueInspectorSignature: { type: Boolean, default: false },
    // Site Visit Data
    sitePhotoUrl: { type: String },
    satelliteSnapshotUrl: { type: String },
    aiAnalysis: { type: String },
    satarkRecommendation: { type: String, enum: ['Approve', 'Reject', 'NeedsReview'] },
    matchScore: { type: Number },
    timestamp: { type: Date },
    syncStatus: { type: String, enum: ['Pending', 'Synced'], default: 'Synced' },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },

  // Remand History - STATUTORY REQUIREMENT (SDLC must remand before reject)
  remandHistory: [{
    date: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    remandedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromStage: { type: String },
    toStage: { type: String },
    aiSuggestion: { type: String } // Vidhi can suggest remand reason
  }],

  // Approval tracking  
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  approvalNotes: { type: String },
  rejectionReason: { type: String },

  // Title Deed (Form C) - Generated after approval
  titleDeed: {
    pdfUrl: { type: String },
    generatedAt: { type: Date },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dlcSignature: { type: Boolean, default: false },
    serialNumber: { type: String }
  },

  // Audit trail
  statusHistory: [{
    status: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String }
  }],

  assetSummary: {
    waterAreasHa: { type: Number },
    farmlandHa: { type: Number },
    forestHa: { type: Number },
    homesteadCount: { type: Number },
    modelVersion: { type: String },
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // AI Embeddings
  embedding: { type: [Number], index: true },

  // AI Insights
  veracityScore: { type: Number, default: 0 },
  eligibleSchemes: [{ type: String }],

  // Legal Workbench Drafts
  draftOrder: {
    english: { type: String },
    vernacular: { type: String },
    lastUpdated: { type: Date }
  }
});

// Static method to validate status transitions
claimSchema.statics.isValidTransition = function (currentStatus, newStatus) {
  const allowedNext = VALID_TRANSITIONS[currentStatus];
  return allowedNext && allowedNext.includes(newStatus);
};

// Instance method to check if joint verification is complete
claimSchema.methods.isJointVerificationComplete = function () {
  const report = this.verificationReport;
  return report &&
    report.forestOfficerSignature &&
    report.revenueInspectorSignature;
};

// Instance method to check if ready for SDLC
claimSchema.methods.isReadyForSDLC = function () {
  return this.gramSabhaResolution?.quorumMet &&
    this.isJointVerificationComplete();
};

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
module.exports.VALID_TRANSITIONS = VALID_TRANSITIONS;
