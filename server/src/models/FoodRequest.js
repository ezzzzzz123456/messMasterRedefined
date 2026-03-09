const mongoose = require('mongoose');

const foodRequestSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true, index: true },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true, index: true },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestedQtyKg: { type: Number, required: true, min: 0.1 },
  ratePerKg: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending',
    index: true,
  },
  grossAmount: { type: Number, default: 0 },
  platformFeePercent: { type: Number, default: 10 },
  platformFeeAmount: { type: Number, default: 0 },
  messPayoutAmount: { type: Number, default: 0 },
  isReadByMess: { type: Boolean, default: false },
  isReadByNgo: { type: Boolean, default: false },
  decidedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true, strict: true });

foodRequestSchema.pre('save', function(next) {
  this.grossAmount = Number((this.requestedQtyKg * this.ratePerKg).toFixed(2));
  this.platformFeeAmount = Number((this.grossAmount * (this.platformFeePercent / 100)).toFixed(2));
  this.messPayoutAmount = Number((this.grossAmount - this.platformFeeAmount).toFixed(2));
  next();
});

foodRequestSchema.index({ messId: 1, status: 1, createdAt: -1 });
foodRequestSchema.index({ ngoId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('FoodRequest', foodRequestSchema);
