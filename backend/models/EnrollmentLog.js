const mongoose = require('mongoose');

const enrollmentLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  activationCode: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivationCode' },
  deviceFingerprint: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  browser: { type: String },
  os: { type: String },
  device: { type: String },
  enrolledAt: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now },
  totalWatchTime: { type: Number, default: 0 }, // in minutes
  lecturesCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }]
});

module.exports = mongoose.model('EnrollmentLog', enrollmentLogSchema);
