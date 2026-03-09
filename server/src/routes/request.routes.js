const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const FoodRequest = require('../models/FoodRequest');
const FoodListing = require('../models/FoodListing');

router.post('/', verifyToken, requireRole('ngo'), async (req, res, next) => {
  try {
    const { listingId, requestedQtyKg } = req.body;
    if (!listingId || !requestedQtyKg) return res.status(400).json({ error: 'listingId and requestedQtyKg are required' });

    const listing = await FoodListing.findById(listingId);
    if (!listing || !listing.isActive) return res.status(404).json({ error: 'Listing not found' });
    if (Number(requestedQtyKg) > listing.quantityAvailableKg) return res.status(400).json({ error: 'Requested quantity exceeds available quantity' });

    const reqDoc = await FoodRequest.create({
      listingId: listing._id,
      messId: listing.messId,
      ngoId: req.user._id,
      requestedQtyKg: Number(requestedQtyKg),
      ratePerKg: listing.ratePerKg,
      status: 'pending',
      isReadByMess: false,
      isReadByNgo: true,
    });

    res.status(201).json(reqDoc);
  } catch (err) {
    next(err);
  }
});

router.get('/ngo', verifyToken, requireRole('ngo'), async (req, res, next) => {
  try {
    const requests = await FoodRequest.find({ ngoId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'listingId', populate: { path: 'messId', select: 'name location' } });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

router.get('/mess', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { messId: req.user.messId };
    if (status) query.status = status;
    const requests = await FoodRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('ngoId', 'name organizationName email location')
      .populate('listingId', 'foodItem foodCategory quantityAvailableKg ratePerKg');
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/decision', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const { decision } = req.body;
    if (!['accepted', 'declined'].includes(decision)) return res.status(400).json({ error: 'decision must be accepted or declined' });

    const requestDoc = await FoodRequest.findOne({ _id: req.params.id, messId: req.user.messId });
    if (!requestDoc) return res.status(404).json({ error: 'Request not found' });
    if (requestDoc.status !== 'pending') return res.status(400).json({ error: 'Only pending requests can be updated' });

    requestDoc.status = decision;
    requestDoc.decidedAt = new Date();
    requestDoc.isReadByMess = true;
    requestDoc.isReadByNgo = false;
    await requestDoc.save();

    if (decision === 'accepted') {
      const listing = await FoodListing.findById(requestDoc.listingId);
      if (listing) {
        listing.quantityAvailableKg = Math.max(0, Number((listing.quantityAvailableKg - requestDoc.requestedQtyKg).toFixed(2)));
        if (listing.quantityAvailableKg <= 0) listing.isActive = false;
        await listing.save();
      }
    }

    res.json(requestDoc);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/complete', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const requestDoc = await FoodRequest.findOne({ _id: req.params.id, messId: req.user.messId });
    if (!requestDoc) return res.status(404).json({ error: 'Request not found' });
    if (requestDoc.status !== 'accepted') return res.status(400).json({ error: 'Only accepted requests can be completed' });

    requestDoc.status = 'completed';
    requestDoc.completedAt = new Date();
    requestDoc.isReadByMess = true;
    requestDoc.isReadByNgo = false;
    await requestDoc.save();
    res.json(requestDoc);
  } catch (err) {
    next(err);
  }
});

router.patch('/mess/notifications/clear', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    await FoodRequest.updateMany({ messId: req.user.messId, isReadByMess: false }, { $set: { isReadByMess: true } });
    res.json({ message: 'Notifications cleared' });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/mark-read-ngo', verifyToken, requireRole('ngo'), async (req, res, next) => {
  try {
    const requestDoc = await FoodRequest.findOne({ _id: req.params.id, ngoId: req.user._id });
    if (!requestDoc) return res.status(404).json({ error: 'Request not found' });
    requestDoc.isReadByNgo = true;
    await requestDoc.save();
    res.json(requestDoc);
  } catch (err) {
    next(err);
  }
});

router.get('/mess/notifications/count', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const count = await FoodRequest.countDocuments({ messId: req.user.messId, status: 'pending', isReadByMess: false });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
