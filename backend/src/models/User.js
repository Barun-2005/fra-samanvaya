const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // New fields
  employeeId: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String },
  avatarUrl: { type: String },

  // Updated roles enum
  roles: {
    type: [{
      type: String,
      enum: [
        'Citizen',
        'Data Entry Officer',
        'Verification Officer',
        'Approving Authority',
        'Scheme Admin',
        'NGO Viewer',
        'Field Worker',
        'Super Admin'
      ]
    }],
    required: true
  },

  // Existing fields
  state: { type: String },
  district: { type: String },
  village: { type: String },
  totpSecret: { type: String },
  maskedAadhaar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Virtual fields for backward compatibility
userSchema.virtual('name').get(function () {
  return this.fullName;
});

userSchema.virtual('role').get(function () {
  return this.roles && this.roles.length > 0 ? this.roles[0] : null;
});

// Ensure virtuals are included in JSON and Object outputs
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// --- Existing pre-save and method hooks ---
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
// --- End of existing hooks ---

const User = mongoose.model('User', userSchema);

module.exports = User;
