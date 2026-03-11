const BioWasteListing = require('../models/BioWasteListing');
const FoodListing = require('../models/FoodListing');

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const NGO_SIMULATION_MS = 30 * 1000;

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

async function expireNgoListings(now = new Date()) {
  const listings = await FoodListing.find({
    isActive: true,
    quantityAvailableKg: { $gt: 0 },
    availableUntil: { $lte: now },
  });

  let updated = 0;
  for (const listing of listings) {
    listing.isActive = false;
    listing.expiredAt = now;
    await listing.save();
    updated += 1;
  }
  return updated;
}

async function getAutoTrackedExpiredKg(messId) {
  const [result] = await FoodListing.aggregate([
    {
      $match: {
        messId,
        isActive: false,
        expiredAt: { $exists: true, $ne: null },
        movedToBioLoopAt: { $exists: false },
        quantityAvailableKg: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        totalKg: { $sum: '$quantityAvailableKg' },
      },
    },
  ]);

  return Number((result?.totalKg || 0).toFixed(2));
}

async function markExpiredNgoListingsConsumed(messId, now = new Date()) {
  const result = await FoodListing.updateMany(
    {
      messId,
      isActive: false,
      expiredAt: { $exists: true, $ne: null },
      movedToBioLoopAt: { $exists: false },
      quantityAvailableKg: { $gt: 0 },
    },
    { $set: { movedToBioLoopAt: now } },
  );

  return result.modifiedCount || 0;
}

module.exports = {
  FOUR_HOURS_MS,
  NGO_SIMULATION_MS,
  resolveScheduledAt,
  activateDueListings,
  expireStaleListings,
  expireNgoListings,
  getAutoTrackedExpiredKg,
  markExpiredNgoListingsConsumed,
};
