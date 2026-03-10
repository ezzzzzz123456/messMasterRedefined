const mongoose = require('mongoose');

const geoPointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: {
    type: [Number],
    validate: {
      validator(value) {
        return !value || (Array.isArray(value) && value.length === 2 && value.every(Number.isFinite));
      },
      message: 'Geo coordinates must contain [longitude, latitude].',
    },
  },
}, { _id: false });

const messSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  capacity: { type: Number },
  established: { type: Number },
  phone: { type: String },
  location: { type: String, trim: true },
  latitude: { type: Number },
  longitude: { type: Number },
  geo: { type: geoPointSchema },
  logo: { type: String, default: '' },
  adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminContact: {
    name: { type: String },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
  },
  // Legacy fields retained for backward compatibility with existing DB records.
  pointOfContact: {
    name: { type: String },
    phone: { type: String },
  },
  representative: {
    name: { type: String },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
  },
  bioLoopSettings: {
    dailyLogTime: { type: String, default: '21:00' },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, strict: true });

messSchema.index({ geo: '2dsphere' });

messSchema.pre('save', function(next) {
  if (Number.isFinite(this.latitude) && Number.isFinite(this.longitude)) {
    this.geo = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  } else if (this.geo?.coordinates?.length === 2) {
    this.longitude = this.geo.coordinates[0];
    this.latitude = this.geo.coordinates[1];
  }
  next();
});

module.exports = mongoose.model('Mess', messSchema);
