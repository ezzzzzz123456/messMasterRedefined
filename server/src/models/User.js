const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['staff', 'student', 'ngo'], required: true },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess' },
  organizationName: { type: String, trim: true },
  location: { type: String, trim: true },
  rollNo: { type: String },
  year: { type: Number },
  avatar: { type: String, default: '' },
  isSetupComplete: { type: Boolean, default: false },
  refreshToken: { type: String },
}, { timestamps: true, strict: true });

userSchema.index({ messId: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
