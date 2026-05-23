const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'USD' },
  thumbnail: { type: String }, // URL to image
  category: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  totalDuration: { type: Number, default: 0 }, // in minutes
  enrolledCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

courseSchema.virtual('lectureCount').get(function() {
  return this.lectures ? this.lectures.length : 0;
});

courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
