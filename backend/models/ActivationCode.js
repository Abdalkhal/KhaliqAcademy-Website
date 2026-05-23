const mongoose = require('mongoose');
const crypto = require('crypto');

const activationCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Stored as hash
  codePlain: { type: String, required: true, unique: true }, // For display only (admin sees this)
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiryDate: { type: Date },
  usageLimit: { type: Number, default: 1 },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, default: 'admin' }
});

// Hash the code before saving
activationCodeSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.code = crypto.createHash('sha256').update(this.code).digest('hex');
  }
  next();
});

// Verify code (compare hash)
activationCodeSchema.methods.verifyCode = function(plainCode) {
  const hashedInput = crypto.createHash('sha256').update(plainCode).digest('hex');
  return this.code === hashedInput;
};

// Check if code is valid and not expired
activationCodeSchema.methods.isValid = function() {
  if (this.isUsed || this.usageCount >= this.usageLimit) return false;
  if (this.expiryDate && new Date() > this.expiryDate) return false;
  return true;
};

module.exports = mongoose.model('ActivationCode', activationCodeSchema);
