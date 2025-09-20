const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  rules: { type: Object }, // JSONLogic rules
  createdAt: { type: Date, default: Date.now },
});

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;
