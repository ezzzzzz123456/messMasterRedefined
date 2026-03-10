const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { execSync } = require('child_process');

async function resetAndSeed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in server/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  await mongoose.connection.db.dropDatabase();
  console.log('Database dropped successfully');
  await mongoose.disconnect();

  execSync('node scripts/seed.js', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
}

resetAndSeed().catch(async (err) => {
  console.error('Reset and seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
