const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  name: { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ['Head Cook', 'Cook', 'Assistant Cook', 'Helper', 'Store Keeper', 'Manager'],
    required: true,
  },
  contactNumber: { type: String },
  speciality: { type: String },
  since: { type: Number },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, strict: true });

staffSchema.virtual('phone')
  .get(function getPhone() { return this.contactNumber; })
  .set(function setPhone(v) { this.contactNumber = v; });

staffSchema.index({ messId: 1 });

module.exports = mongoose.model('Staff', staffSchema);
