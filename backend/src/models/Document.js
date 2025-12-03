const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  claim: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileRef: { type: String, required: true },
  type: { type: String, default: 'Document' },
  ocrText: { type: String },
  ocrConfidence: { type: Number },

  // Tier 2: Duplicate Detection
  fileFingerprint: { type: String, index: true }, // SHA-256 hash

  // Tier 3: Relationship Mapping
  relatedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],

  // Tier 1: Smart Doc Metadata
  metadata: { type: Object }, // Structured JSON from Gemini
  anomalies: [{ type: String }], // Validation flags

  createdAt: { type: Date, default: Date.now },
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
