const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const FoodListing = require('../models/FoodListing');
const Feedback = require('../models/Feedback');
const MenuItem = require('../models/MenuItem');

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
      .populate('messId', 'name location phone')
      .populate('createdBy', 'name');
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

router.get('/public/:id', verifyToken, requireRole('ngo'), async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id).populate('messId', 'name location phone adminContact representative pointOfContact');
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
