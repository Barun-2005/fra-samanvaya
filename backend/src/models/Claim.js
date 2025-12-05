const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: false },
  status: { type: String, enum: ['Draft', 'Submitted', 'InVerification', 'Verified', 'Approved', 'Rejected', 'ConflictDetected'], default: 'Draft' },

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
  boundaryArea: { type: Number }, // Calculated area from GeoJSON
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

  // Verification tracking
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  verificationNotes: { type: String },

  // Satark Verification Report (Offline Sync Support)
  verificationReport: {
    fieldWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sitePhotoUrl: { type: String },
    satelliteSnapshotUrl: { type: String },
    aiAnalysis: { type: String },
    matchScore: { type: Number }, // 0-100
    timestamp: { type: Date },
    syncStatus: { type: String, enum: ['Pending', 'Synced'], default: 'Synced' },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },

  // Approval tracking  
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  approvalNotes: { type: String },
  rejectionReason: { type: String },

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
  embedding: { type: [Number], index: true }, // For Vector Search

  // AI Insights
  veracityScore: { type: Number, default: 0 }, // 0-100
  eligibleSchemes: [{ type: String }], // List of scheme names

  // Legal Workbench Drafts
  draftOrder: {
    english: { type: String },
    vernacular: { type: String },
    lastUpdated: { type: Date }
  }
});

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
