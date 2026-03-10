const mongoose = require('mongoose');

const bioWasteRequestSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'BioWasteListing', required: true, index: true },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true, index: true },
  bioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestedQtyKg: { type: Number, required: true, min: 0.1 },
  offeredRatePerKg: { type: Number, required: true, min: 0 },
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
  isReadByBio: { type: Boolean, default: false },
  decidedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true, strict: true });

bioWasteRequestSchema.pre('save', function(next) {
  this.grossAmount = Number((this.requestedQtyKg * this.offeredRatePerKg).toFixed(2));
  this.platformFeeAmount = Number((this.grossAmount * (this.platformFeePercent / 100)).toFixed(2));
  this.messPayoutAmount = Number((this.grossAmount - this.platformFeeAmount).toFixed(2));
  next();
});

bioWasteRequestSchema.index({ messId: 1, status: 1, createdAt: -1 });
bioWasteRequestSchema.index({ bioId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('BioWasteRequest', bioWasteRequestSchema);
