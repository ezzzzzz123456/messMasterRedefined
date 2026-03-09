const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const MenuItem = require('../models/MenuItem');
const WasteLog = require('../models/WasteLog');

router.use(verifyToken, requireRole('staff'));

router.get('/', async (req, res, next) => {
  try {
    const items = await MenuItem.find({ messId: req.user.messId, isActive: true });
    res.json({ items });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await MenuItem.create({ ...req.body, messId: req.user.messId });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await MenuItem.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Item deactivated' });
  } catch (err) { next(err); }
});

router.get('/correlation', async (req, res, next) => {
  try {
    const logs = await WasteLog.aggregate([
      { $match: { messId: req.user.messId } },
      { $group: { _id: '$menuItemName', totalWaste: { $sum: '$wastedKg' }, count: { $sum: 1 }, avgWaste: { $avg: '$wastedKg' } } },
      { $sort: { totalWaste: -1 } },
      { $limit: 10 },
    ]);
    const itemsWithRisk = logs.map(l => ({ ...l, name: l._id, riskScore: Math.min(100, (l.avgWaste / 20) * 100) }));
    res.json({ items: itemsWithRisk });
  } catch (err) { next(err); }
});

module.exports = router;
