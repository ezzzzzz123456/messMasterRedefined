const BioWasteListing = require('../models/BioWasteListing');

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

function parseDailyTimeToDate(timeString, now = new Date()) {
  const [hour = '21', minute = '00'] = String(timeString || '21:00').split(':');
  const scheduled = new Date(now);
  scheduled.setSeconds(0, 0);
  scheduled.setHours(Number(hour) || 21, Number(minute) || 0, 0, 0);
  return scheduled;
}

function resolveScheduledAt({ overrideScheduledAt, dailyLogTime, now = new Date() }) {
  if (overrideScheduledAt) {
    const parsed = new Date(overrideScheduledAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return parseDailyTimeToDate(dailyLogTime, now);
}

async function activateDueListings(now = new Date()) {
  const listings = await BioWasteListing.find({
    status: 'scheduled',
    scheduledAt: { $lte: now },
  });

  let updated = 0;
  for (const listing of listings) {
    listing.status = 'active';
    listing.activatedAt = now;
    listing.availableUntil = new Date(now.getTime() + FOUR_HOURS_MS);
    listing.isMarketplaceVisible = true;
    await listing.save();
    updated += 1;
  }
  return updated;
}

async function expireStaleListings(now = new Date()) {
  const listings = await BioWasteListing.find({
    status: 'active',
    isMarketplaceVisible: true,
    availableUntil: { $lte: now },
  });

  let updated = 0;
  for (const listing of listings) {
    listing.status = 'expired';
    listing.isMarketplaceVisible = false;
    listing.finalizedAt = now;
    await listing.save();
    updated += 1;
  }
  return updated;
}

module.exports = {
  FOUR_HOURS_MS,
  resolveScheduledAt,
  activateDueListings,
  expireStaleListings,
};
