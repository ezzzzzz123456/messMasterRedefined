const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodCategory: { type: String, required: true, trim: true },
  foodItem: { type: String, required: true, trim: true },
  quantityAvailableKg: { type: Number, required: true, min: 0 },
  ratePerKg: { type: Number, required: true, min: 0 },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, strict: true });

foodListingSchema.index({ messId: 1, createdAt: -1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
