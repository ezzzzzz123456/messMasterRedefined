require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  // Validate required env vars before attempting connection
  const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please check your server/.env file');
    process.exit(1);
  }

  logger.info('🚀 Starting MessMaster server...');
  logger.info(`📦 Node env: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Connecting to: ${process.env.MONGODB_URI?.replace(/:([^:@]+)@/, ':***@')}`);

  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`✅ MessMaster server running on http://localhost:${PORT}`);
      logger.info(`📡 API available at http://localhost:${PORT}/api/v1`);
    });
  } catch (err) {
    logger.error('💥 Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
