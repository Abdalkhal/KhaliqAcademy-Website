const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of 4 options
  correctAnswer: { type: Number, required: true }, // Index of correct option (0-3)
  explanation: { type: String }
});

const lectureSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String }, // Secure URL (not direct path)
  videoDuration: { type: Number, default: 0 }, // in seconds
  order: { type: Number, default: 0 },
  isPreview: { type: Boolean, default: false },
  quiz: [quizQuestionSchema],
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['pdf', 'link', 'code'] }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lecture', lectureSchema);
