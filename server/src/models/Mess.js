const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  capacity: { type: Number },
  established: { type: Number },
  phone: { type: String },
  location: { type: String },
  logo: { type: String, default: '' },
  adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pointOfContact: {
    name: { type: String },
    phone: { type: String },
  },
  representative: {
    name: { type: String },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, strict: true });

module.exports = mongoose.model('Mess', messSchema);
