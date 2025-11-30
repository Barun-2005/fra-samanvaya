const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  claim: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Queued', 'Processing', 'Completed', 'Failed'], default: 'Queued' },
  polygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  snapshotImage: { type: String },
  meta: {
    mapZoom: { type: Number },
    center: { type: [Number] },
    dateRequested: { type: Date },
  },
  result: {
    waterAreasHa: { type: Number },
    farmlandHa: { type: Number },
    forestHa: { type: Number },
    homesteadCount: { type: Number },
    modelVersion: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
