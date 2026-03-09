const mongoose = require('mongoose');

const cookReviewSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: Date, required: true },
  dishes: [{
    menuItemName: String,
    preparedKg: Number,
    wastedKg: Number,
    studentRating: Number,
    onTime: Boolean,
  }],
  wasteRatio: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  onTimeScore: { type: Number, default: 0 },
  compositeScore: { type: Number, default: 0 },
  grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C'], default: 'B' },
  aiReviewText: { type: String, default: '' },
  generatedAt: { type: Date },
}, { timestamps: true, strict: true });

cookReviewSchema.index({ messId: 1, date: -1 });

module.exports = mongoose.model('CookReview', cookReviewSchema);
