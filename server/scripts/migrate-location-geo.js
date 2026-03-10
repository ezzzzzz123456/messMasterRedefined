const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Mess = require('../src/models/Mess');
const User = require('../src/models/User');
const { geocodeLocation } = require('../src/services/geocoding.service');

async function applyLocation(document, label) {
  if (!document.location || (Number.isFinite(document.latitude) && Number.isFinite(document.longitude))) {
    return false;
  }

  const resolved = await geocodeLocation(document.location);
  if (!resolved) {
    console.warn(`Skipped ${label}: unable to resolve "${document.location}"`);
    return false;
  }

  document.location = resolved.displayName;
  document.latitude = resolved.latitude;
  document.longitude = resolved.longitude;
  await document.save();
  return true;
}

async function migrate() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in server/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const messes = await Mess.find({});
  const ngos = await User.find({ role: 'ngo' });

  let updatedMesses = 0;
  for (const mess of messes) {
    if (await applyLocation(mess, `mess:${mess.name}`)) updatedMesses += 1;
  }

  let updatedNgos = 0;
  for (const ngo of ngos) {
    if (await applyLocation(ngo, `ngo:${ngo.email}`)) updatedNgos += 1;
  }

  console.log(`Location migration completed. Updated ${updatedMesses} messes and ${updatedNgos} NGOs.`);
}

migrate()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Location migration failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
