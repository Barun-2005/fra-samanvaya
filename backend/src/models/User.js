const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  // --- THIS IS THE FIX ---
  roles: { 
    type: [{ 
      type: String, 
      enum: ['SuperAdmin', 'DataEntry', 'Verifier', 'Approver', 'SchemeAdmin', 'NGOViewer'] 
    }], 
    default: ['DataEntry'] 
  },
  // --- END OF FIX ---
  state: { type: String },
  district: { type: String },
  totpSecret: { type: String },
  maskedAadhaar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
