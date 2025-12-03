const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active' },
  budget: { type: String }, // e.g. "₹50 Cr"
  beneficiaries: { type: Number, default: 0 },
  rules: { type: Object }, // JSONLogic rules
  createdAt: { type: Date, default: Date.now },
});

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;
