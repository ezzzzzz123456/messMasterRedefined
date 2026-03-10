const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const FoodListing = require('../models/FoodListing');
const Feedback = require('../models/Feedback');
const MenuItem = require('../models/MenuItem');
const Mess = require('../models/Mess');

const NEARBY_RADIUS_METERS = 20000;

function getUserCoordinates(user) {
  if (Array.isArray(user?.geo?.coordinates) && user.geo.coordinates.length === 2) {
    return user.geo.coordinates;
  }
  if (Number.isFinite(user?.longitude) && Number.isFinite(user?.latitude)) {
    return [user.longitude, user.latitude];
  }
  return null;
}

router.post('/', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const { foodCategory, foodItem, quantityAvailableKg, ratePerKg, notes } = req.body;
    if (!foodCategory || !foodItem || !quantityAvailableKg || !ratePerKg) {
      return res.status(400).json({ error: 'foodCategory, foodItem, quantityAvailableKg, ratePerKg are required' });
    }
    if (!req.user.messId) return res.status(400).json({ error: 'User is not linked to any mess' });

    const approvedItem = await MenuItem.findOne({
      messId: req.user.messId,
      isActive: true,
      name: new RegExp(`^${String(foodItem).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });
    if (!approvedItem) {
      return res.status(400).json({ error: 'Only approved menu items can be listed' });
    }

    const listing = await FoodListing.create({
      messId: req.user.messId,
      createdBy: req.user._id,
      foodCategory: approvedItem.category || foodCategory,
      foodItem: approvedItem.name,
      quantityAvailableKg: Number(quantityAvailableKg),
      ratePerKg: Number(ratePerKg),
      notes: notes || '',
      isActive: true,
    });

    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
});

router.get('/mine', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const listings = await FoodListing.find({ messId: req.user.messId })
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/toggle', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const listing = await FoodListing.findOne({ _id: req.params.id, messId: req.user.messId });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    listing.isActive = !listing.isActive;
    await listing.save();
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

router.get('/public/all', verifyToken, requireRole('ngo'), async (req, res, next) => {
  try {
    const listings = await FoodListing.find({ isActive: true, quantityAvailableKg: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .populate('messId', 'name location phone latitude longitude geo')
      .populate('createdBy', 'name');
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

router.get('/public/nearby', verifyToken, requireRole('ngo'), async (req, res, next) => {
  try {
    const ngoCoordinates = getUserCoordinates(req.user);
    if (!ngoCoordinates) {
      return res.status(400).json({ error: 'NGO location is not configured for map search' });
    }

    const nearbyMesses = await Mess.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: ngoCoordinates },
          distanceField: 'distanceMeters',
          maxDistance: NEARBY_RADIUS_METERS,
          spherical: true,
          query: { isActive: true, geo: { $exists: true } },
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
    if (!messIds.length) {
      return res.json({
        center: {
          latitude: req.user.latitude,
          longitude: req.user.longitude,
          location: req.user.location,
        },
        radiusKm: 20,
        messes: [],
        listings: [],
      });
    }

    const listings = await FoodListing.find({
      isActive: true,
      quantityAvailableKg: { $gt: 0 },
      messId: { $in: messIds },
    })
      .sort({ createdAt: -1 })
      .populate('messId', 'name location phone latitude longitude geo')
      .populate('createdBy', 'name')
      .lean();

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
      radiusKm: 20,
      messes,
      listings,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/public/:id', verifyToken, requireRole('ngo'), async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id).populate('messId', 'name location phone latitude longitude geo adminContact representative pointOfContact');
    if (!listing || !listing.isActive) return res.status(404).json({ error: 'Listing not found' });

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

module.exports = router;
