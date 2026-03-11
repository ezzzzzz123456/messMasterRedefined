const cron = require('node-cron');
const logger = require('../config/logger');
const { activateDueListings, expireStaleListings, expireNgoListings } = require('./bioloop.service');

function startBioLoopScheduler() {
  return cron.schedule('*/10 * * * * *', async () => {
    try {
      const ngoExpired = await expireNgoListings(new Date());
      const activated = await activateDueListings(new Date());
      const expired = await expireStaleListings(new Date());
      if (ngoExpired || activated || expired) {
        logger.info(`BioLoop scheduler updated listings. NGO Expired: ${ngoExpired}, Activated: ${activated}, Expired: ${expired}`);
      }
    } catch (error) {
      logger.error(`BioLoop scheduler failed: ${error.message}`);
    }
  });
}

module.exports = {
  startBioLoopScheduler,
};
