const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  meal: { type: String, enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], required: true },
  overallRating: { type: Number, min: 1, max: 5, required: true },
  tasteRating: { type: Number, min: 1, max: 5 },
  portionRating: { type: Number, min: 1, max: 5 },
  freshnessRating: { type: Number, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
}, { timestamps: true, strict: true });

feedbackSchema.index({ messId: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
