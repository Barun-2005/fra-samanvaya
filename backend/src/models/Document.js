const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  claim: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileRef: { type: String, required: true },
  ocrText: { type: String },
  ocrConfidence: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
