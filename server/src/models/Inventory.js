const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Grains', 'Legumes', 'Vegetables', 'Dairy', 'Spices', 'Oils', 'Utensils', 'Energy', 'Other'],
    required: true,
  },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  minQuantity: { type: Number, required: true, default: 0 },
  costPerUnit: { type: Number, default: 0 },
  icon: { type: String, default: '📦' },
}, { timestamps: true, strict: true });

inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minQuantity;
});

// Backward-compatible aliases used in older UI code.
inventorySchema.virtual('qty')
  .get(function getQty() { return this.quantity; })
  .set(function setQty(v) { this.quantity = v; });

inventorySchema.virtual('minQty')
  .get(function getMinQty() { return this.minQuantity; })
  .set(function setMinQty(v) { this.minQuantity = v; });

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.index({ messId: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
