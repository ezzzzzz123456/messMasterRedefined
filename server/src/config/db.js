const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async (retries = 5) => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in .env file');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        retryWrites: true,
      });

      logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      logger.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);

      if (attempt === retries) {
        throw new Error(`Failed to connect to MongoDB after ${retries} attempts. Check your MONGODB_URI and Atlas Network Access settings.`);
      }

      const delay = attempt * 2000;
      logger.info(`⏳ Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

module.exports = { connectDB };
