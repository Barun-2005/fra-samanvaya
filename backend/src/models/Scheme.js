const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Draft', 'Expired'], default: 'Draft' },
  budget: { type: String },
  beneficiaries: { type: Number, default: 0 },
  // Smart Rules for AI/Backend processing
  rules: [{
    criteria: { type: String }, // e.g., 'landSize', 'caste', 'income'
    operator: { type: String }, // e.g., '>', '<', '==', 'includes'
    value: { type: mongoose.Schema.Types.Mixed }, // e.g., 2, 'ST', 50000
    logicalOp: { type: String, enum: ['AND', 'OR'], default: 'AND' }
  }],
  // Structured Benefits
  benefits: [{
    type: { type: String }, // e.g., 'Financial', 'Subsidy', 'Insurance'
    amount: { type: Number },
    description: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
});

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;
