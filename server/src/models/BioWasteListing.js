const mongoose = require('mongoose');

const bioWasteListingSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wasteType: {
    type: String,
    enum: ['expired_food', 'dumped_food', 'biodegradable_waste'],
    required: true,
    index: true,
  },
  itemName: { type: String, required: true, trim: true },
  autoTrackedExpiredKg: { type: Number, default: 0, min: 0 },
  manualDumpedKg: { type: Number, default: 0, min: 0 },
  quantityAvailableKg: { type: Number, required: true, min: 0.1 },
  ratePerKg: { type: Number, required: true, min: 0.01 },
  notes: { type: String, default: '' },
  scheduledAt: { type: Date, required: true, index: true },
  activatedAt: { type: Date },
  availableUntil: { type: Date, index: true },
  finalizedAt: { type: Date },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'accepted', 'expired', 'completed', 'deactivated'],
    default: 'scheduled',
    index: true,
  },
  isMarketplaceVisible: { type: Boolean, default: false, index: true },
}, { timestamps: true, strict: true });

bioWasteListingSchema.index({ messId: 1, status: 1, scheduledAt: -1 });
bioWasteListingSchema.index({ isMarketplaceVisible: 1, availableUntil: 1 });

module.exports = mongoose.model('BioWasteListing', bioWasteListingSchema);
