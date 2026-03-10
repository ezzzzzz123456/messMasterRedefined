const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const BioWasteRequest = require('../models/BioWasteRequest');
const BioWasteListing = require('../models/BioWasteListing');

router.post('/', verifyToken, requireRole('bio'), async (req, res, next) => {
  try {
    const { listingId, requestedQtyKg, offeredRatePerKg } = req.body;
    if (!listingId || !requestedQtyKg || offeredRatePerKg === undefined) {
      return res.status(400).json({ error: 'listingId, requestedQtyKg, offeredRatePerKg are required' });
    }

    const listing = await BioWasteListing.findById(listingId);
    if (!listing || !listing.isMarketplaceVisible || listing.status !== 'active') {
      return res.status(404).json({ error: 'BioLoop listing not found' });
    }
    if (Number(requestedQtyKg) > listing.quantityAvailableKg) {
      return res.status(400).json({ error: 'Requested quantity exceeds available quantity' });
    }

    const requestDoc = await BioWasteRequest.create({
      listingId: listing._id,
      messId: listing.messId,
      bioId: req.user._id,
      requestedQtyKg: Number(requestedQtyKg),
      offeredRatePerKg: Number(offeredRatePerKg),
      status: 'pending',
      isReadByMess: false,
      isReadByBio: true,
    });

    res.status(201).json(requestDoc);
  } catch (err) {
    next(err);
  }
});

router.get('/bio', verifyToken, requireRole('bio'), async (req, res, next) => {
  try {
    const requests = await BioWasteRequest.find({ bioId: req.user._id })
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
    const requests = await BioWasteRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('bioId', 'name organizationName email location')
      .populate('listingId', 'itemName wasteType quantityAvailableKg ratePerKg');
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/decision', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const { decision } = req.body;
    if (!['accepted', 'declined'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be accepted or declined' });
    }

    const requestDoc = await BioWasteRequest.findOne({ _id: req.params.id, messId: req.user.messId });
    if (!requestDoc) return res.status(404).json({ error: 'Request not found' });
    if (requestDoc.status !== 'pending') return res.status(400).json({ error: 'Only pending requests can be updated' });

    requestDoc.status = decision;
    requestDoc.decidedAt = new Date();
    requestDoc.isReadByMess = true;
    requestDoc.isReadByBio = false;
    await requestDoc.save();

    if (decision === 'accepted') {
      const listing = await BioWasteListing.findById(requestDoc.listingId);
      if (listing) {
        listing.status = 'accepted';
        listing.isMarketplaceVisible = false;
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
    const requestDoc = await BioWasteRequest.findOne({ _id: req.params.id, messId: req.user.messId });
    if (!requestDoc) return res.status(404).json({ error: 'Request not found' });
    if (requestDoc.status !== 'accepted') return res.status(400).json({ error: 'Only accepted requests can be completed' });

    requestDoc.status = 'completed';
    requestDoc.completedAt = new Date();
    requestDoc.isReadByMess = true;
    requestDoc.isReadByBio = false;
    await requestDoc.save();

    const listing = await BioWasteListing.findById(requestDoc.listingId);
    if (listing) {
      listing.status = 'completed';
      listing.finalizedAt = new Date();
      listing.isMarketplaceVisible = false;
      await listing.save();
    }

    res.json(requestDoc);
  } catch (err) {
    next(err);
  }
});

router.patch('/mess/notifications/clear', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    await BioWasteRequest.updateMany({ messId: req.user.messId, isReadByMess: false }, { $set: { isReadByMess: true } });
    res.json({ message: 'Notifications cleared' });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/mark-read-bio', verifyToken, requireRole('bio'), async (req, res, next) => {
  try {
    const requestDoc = await BioWasteRequest.findOne({ _id: req.params.id, bioId: req.user._id });
    if (!requestDoc) return res.status(404).json({ error: 'Request not found' });
    requestDoc.isReadByBio = true;
    await requestDoc.save();
    res.json(requestDoc);
  } catch (err) {
    next(err);
  }
});

router.get('/mess/notifications/count', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const count = await BioWasteRequest.countDocuments({ messId: req.user.messId, status: 'pending', isReadByMess: false });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
