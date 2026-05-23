const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deviceSchema = new mongoose.Schema({
  fingerprint: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  browser: { type: String },
  os: { type: String },
  device: { type: String },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  // No email/password - activation code based
  activationCodeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ActivationCode',
    required: true,
    unique: true
  },
  enrolledCourses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 }, // percentage
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
    quizScores: [{
      lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
      score: Number,
      totalQuestions: Number,
      submittedAt: { type: Date, default: Date.now }
    }]
  }],
  devices: [deviceSchema],
  maxDevices: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Check if device limit reached
userSchema.methods.canAddDevice = function() {
  const activeDevices = this.devices.filter(d => {
    const daysSinceActive = (Date.now() - d.lastActive.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceActive < 30; // Device considered active if used within 30 days
  });
  return activeDevices.length < this.maxDevices;
};

// Update or add device
userSchema.methods.updateDevice = async function(fingerprint, ipAddress, userAgent, parsedUA) {
  const existingIndex = this.devices.findIndex(d => d.fingerprint === fingerprint);

  if (existingIndex >= 0) {
    this.devices[existingIndex].lastActive = new Date();
    this.devices[existingIndex].ipAddress = ipAddress;
  } else {
    if (!this.canAddDevice()) {
      throw new Error('DEVICE_LIMIT_REACHED');
    }
    this.devices.push({
      fingerprint,
      ipAddress,
      userAgent,
      browser: parsedUA.browser?.name,
      os: parsedUA.os?.name,
      device: parsedUA.device?.type || 'desktop'
    });
  }
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
