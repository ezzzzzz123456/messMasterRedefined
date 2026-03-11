const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const BioWasteListing = require('../models/BioWasteListing');
const Feedback = require('../models/Feedback');
const Mess = require('../models/Mess');
const {
  FOUR_HOURS_MS,
  resolveScheduledAt,
  getAutoTrackedExpiredKg,
  markExpiredNgoListingsConsumed,
} = require('../services/bioloop.service');

const BIO_RADIUS_METERS = 50000;

function getUserCoordinates(user) {
  if (Array.isArray(user?.geo?.coordinates) && user.geo.coordinates.length === 2) {
    return user.geo.coordinates;
  }
  if (Number.isFinite(user?.longitude) && Number.isFinite(user?.latitude)) {
    return [user.longitude, user.latitude];
  }
  return null;
}

function buildVisibleListingsQuery(extraQuery = {}) {
  return BioWasteListing.find({
    isMarketplaceVisible: true,
    status: 'active',
    quantityAvailableKg: { $gt: 0 },
    ...extraQuery,
  })
    .sort({ createdAt: -1 })
    .populate('messId', 'name location phone latitude longitude geo')
    .populate('createdBy', 'name');
}

router.get('/public/preview', async (req, res, next) => {
  try {
    const listings = await buildVisibleListingsQuery();
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

router.get('/public/nearby', verifyToken, requireRole('bio'), async (req, res, next) => {
  try {
    const bioCoordinates = getUserCoordinates(req.user);
    if (!bioCoordinates) {
      return res.status(400).json({ error: 'BioLoop location is not configured for map search' });
    }

    const nearbyMesses = await Mess.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: bioCoordinates },
          distanceField: 'distanceMeters',
          maxDistance: BIO_RADIUS_METERS,
          spherical: true,
          query: { isActive: true },
        },
      },
      {
        $project: {
          name: 1,
          location: 1,
          phone: 1,
          latitude: 1,
          longitude: 1,
          geo: 1,
          distanceMeters: 1,
        },
      },
    ]);

    const messIds = nearbyMesses.map((mess) => mess._id);
    const listings = await buildVisibleListingsQuery({ messId: { $in: messIds } }).lean();
    const listingCountByMess = listings.reduce((acc, listing) => {
      const messId = String(listing.messId?._id || listing.messId);
      acc[messId] = (acc[messId] || 0) + 1;
      return acc;
    }, {});

    const activeMessIds = new Set(Object.keys(listingCountByMess));
    const messes = nearbyMesses
      .filter((mess) => activeMessIds.has(String(mess._id)))
      .map((mess) => ({
        ...mess,
        distanceKm: Number((mess.distanceMeters / 1000).toFixed(2)),
        activeListingCount: listingCountByMess[String(mess._id)] || 0,
      }));

    res.json({
      center: {
        latitude: req.user.latitude,
        longitude: req.user.longitude,
        location: req.user.location,
      },
      radiusKm: 50,
      messes,
      listings,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/public/:id', verifyToken, requireRole('bio'), async (req, res, next) => {
  try {
    const listing = await BioWasteListing.findById(req.params.id)
      .populate('messId', 'name location phone latitude longitude geo adminContact representative pointOfContact');
    if (!listing || !listing.isMarketplaceVisible || listing.status !== 'active') {
      return res.status(404).json({ error: 'BioLoop listing not found' });
    }

    const [reviewSummary] = await Feedback.aggregate([
      { $match: { messId: listing.messId._id } },
      { $group: { _id: null, avgOverall: { $avg: '$overallRating' }, count: { $sum: 1 } } },
    ]);

    res.json({
      listing,
      messReview: reviewSummary || { avgOverall: 0, count: 0 },
    });
  } catch (err) {
    next(err);
  }
});

router.use(verifyToken);

router.get('/mine', requireRole('staff'), async (req, res, next) => {
  try {
    const listings = await BioWasteListing.find({ messId: req.user.messId }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

router.get('/settings', requireRole('staff'), async (req, res, next) => {
  try {
    const mess = await Mess.findById(req.user.messId).select('bioLoopSettings');
    res.json({ settings: mess?.bioLoopSettings || { dailyLogTime: '21:00' } });
  } catch (err) {
    next(err);
  }
});

router.get('/tracker', requireRole('staff'), async (req, res, next) => {
  try {
    const autoTrackedExpiredKg = await getAutoTrackedExpiredKg(req.user.messId);
    res.json({
      autoTrackedExpiredKg,
      simulationWindowMinutes: 0.5,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/settings', requireRole('staff'), async (req, res, next) => {
  try {
    const dailyLogTime = String(req.body.dailyLogTime || '').trim();
    if (!/^\d{2}:\d{2}$/.test(dailyLogTime)) {
      return res.status(400).json({ error: 'dailyLogTime must be in HH:MM format' });
    }

    const mess = await Mess.findByIdAndUpdate(
      req.user.messId,
      { $set: { 'bioLoopSettings.dailyLogTime': dailyLogTime } },
      { new: true, runValidators: true },
    );

    res.json({ settings: mess?.bioLoopSettings || { dailyLogTime } });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('staff'), async (req, res, next) => {
  try {
    const { manualDumpedKg, ratePerKg, notes } = req.body;
    if (manualDumpedKg === undefined || ratePerKg === undefined) {
      return res.status(400).json({ error: 'manualDumpedKg and ratePerKg are required' });
    }
    const parsedRatePerKg = Number(ratePerKg);
    if (!Number.isFinite(parsedRatePerKg) || parsedRatePerKg <= 0) {
      return res.status(400).json({ error: 'ratePerKg must be greater than zero' });
    }
    if (Number(manualDumpedKg) < 0) {
      return res.status(400).json({ error: 'manualDumpedKg cannot be negative' });
    }

    const mess = await Mess.findById(req.user.messId).select('bioLoopSettings');
    if (!mess) return res.status(404).json({ error: 'Mess not found' });

    const now = new Date();
    const resolvedScheduledAt = resolveScheduledAt({
      dailyLogTime: mess.bioLoopSettings?.dailyLogTime || '21:00',
      now,
    });
    const autoTrackedExpiredKg = await getAutoTrackedExpiredKg(req.user.messId);
    const manualQty = Number(manualDumpedKg);
    const totalQty = Number((autoTrackedExpiredKg + manualQty).toFixed(2));

    if (totalQty <= 0) {
      return res.status(400).json({ error: 'There is no biodegradable waste available to list yet' });
    }

    const listing = await BioWasteListing.create({
      messId: req.user.messId,
      createdBy: req.user._id,
      wasteType: 'biodegradable_waste',
      itemName: 'Biodegradable Waste',
      autoTrackedExpiredKg,
      manualDumpedKg: manualQty,
      quantityAvailableKg: totalQty,
      ratePerKg: parsedRatePerKg,
      notes: notes || '',
      scheduledAt: resolvedScheduledAt,
      status: resolvedScheduledAt <= now ? 'active' : 'scheduled',
      activatedAt: resolvedScheduledAt <= now ? now : undefined,
      availableUntil: resolvedScheduledAt <= now ? new Date(now.getTime() + FOUR_HOURS_MS) : undefined,
      finalizedAt: undefined,
      isMarketplaceVisible: resolvedScheduledAt <= now,
    });

    await markExpiredNgoListingsConsumed(req.user.messId, now);

    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/toggle', requireRole('staff'), async (req, res, next) => {
  try {
    const listing = await BioWasteListing.findOne({ _id: req.params.id, messId: req.user.messId });
    if (!listing) return res.status(404).json({ error: 'BioLoop listing not found' });

    if (listing.status === 'accepted' || listing.status === 'completed' || listing.status === 'expired') {
      return res.status(400).json({ error: 'This listing can no longer be toggled' });
    }

    const nextVisible = !listing.isMarketplaceVisible;
    listing.isMarketplaceVisible = nextVisible;
    listing.status = nextVisible ? 'active' : 'deactivated';
    if (nextVisible) {
      const now = new Date();
      listing.activatedAt = now;
      listing.availableUntil = new Date(now.getTime() + FOUR_HOURS_MS);
    }
    await listing.save();
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
