require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('🔗 Testing connection to:', uri.replace(/:([^:@]+)@/, ':***@'));
console.log('⏳ Connecting...\n');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
})
.then((conn) => {
  console.log('✅ SUCCESS! Connected to MongoDB');
  console.log('📍 Host:', conn.connection.host);
  console.log('🗄️  Database:', conn.connection.name);
  console.log('\nYour MongoDB connection is working correctly!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ FAILED to connect:', err.message);
  console.log('\n🔍 Troubleshooting:');
  console.log('1. Check Atlas Network Access → 0.0.0.0/0 is Active');
  console.log('2. Check your username and password are correct');
  console.log('3. Make sure password has no special characters like @ # $');
  console.log('4. Verify the cluster URL is correct');
  process.exit(1);
});
