const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Breakfast', 'Main Course', 'Side Dish', 'Snacks', 'Dessert', 'Beverages'],
    required: true,
  },
  ingredients: [{ type: String }],
  avgWasteKg: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, strict: true });

menuItemSchema.index({ messId: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
