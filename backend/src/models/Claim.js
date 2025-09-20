const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  status: { type: String, enum: ['Draft', 'Submitted', 'InVerification', 'Approved', 'Rejected'], default: 'Draft' },
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
