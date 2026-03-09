const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  meal: { type: String, enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], required: true },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  menuItemName: { type: String, required: true },
  preparedKg: { type: Number, required: true },
  wastedKg: { type: Number, required: true },
  costLoss: { type: Number, default: 0 },
  co2Kg: { type: Number, default: 0 },
}, { timestamps: true, strict: true });

wasteLogSchema.virtual('wastePercent').get(function() {
  if (this.preparedKg === 0) return 0;
  return ((this.wastedKg / this.preparedKg) * 100).toFixed(1);
});

wasteLogSchema.pre('save', function(next) {
  this.costLoss = this.wastedKg * 40;
  this.co2Kg = this.wastedKg * 2.5;
  next();
});

wasteLogSchema.index({ messId: 1, createdAt: -1 });
wasteLogSchema.index({ messId: 1, date: -1 });

module.exports = mongoose.model('WasteLog', wasteLogSchema);
