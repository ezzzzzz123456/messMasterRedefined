const cron = require('node-cron');
const logger = require('../config/logger');
const { activateDueListings, expireStaleListings } = require('./bioloop.service');

function startBioLoopScheduler() {
  return cron.schedule('*/10 * * * *', async () => {
    try {
      const activated = await activateDueListings(new Date());
      const expired = await expireStaleListings(new Date());
      if (activated || expired) {
        logger.info(`BioLoop scheduler updated listings. Activated: ${activated}, Expired: ${expired}`);
      }
    } catch (error) {
      logger.error(`BioLoop scheduler failed: ${error.message}`);
    }
  });
}

module.exports = {
  startBioLoopScheduler,
};
