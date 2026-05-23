const mongoose = require('mongoose');

const videoTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VideoToken', videoTokenSchema);
