const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Mess = require('../src/models/Mess');

async function migrate() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in server/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const messes = await Mess.find({});
  let updated = 0;

  for (const mess of messes) {
    if (mess.adminContact?.name && mess.adminContact?.email && mess.adminContact?.phone) continue;

    const adminContact = {
      name: mess.adminContact?.name || mess.representative?.name || mess.pointOfContact?.name || 'Admin',
      email: mess.adminContact?.email || mess.representative?.email || '',
      phone: mess.adminContact?.phone || mess.representative?.phone || mess.pointOfContact?.phone || mess.phone || '',
    };

    mess.adminContact = adminContact;
    await mess.save();
    updated += 1;
  }

  console.log(`Migration completed. Updated ${updated} mess records.`);
}

migrate()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Migration failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
