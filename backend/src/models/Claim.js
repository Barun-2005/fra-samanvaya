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
});

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
