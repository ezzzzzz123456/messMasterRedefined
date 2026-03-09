const mongoose = require('mongoose');

const energyLogSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  gasKg: { type: Number, default: 0 },
  electricityKwh: { type: Number, default: 0 },
  gasCost: { type: Number, default: 0 },
  electricityCost: { type: Number, default: 0 },
}, { timestamps: true, strict: true });

energyLogSchema.pre('save', function(next) {
  this.gasCost = this.gasKg * 85;
  this.electricityCost = this.electricityKwh * 8;
  next();
});

energyLogSchema.index({ messId: 1, date: -1 });

module.exports = mongoose.model('EnergyLog', energyLogSchema);
