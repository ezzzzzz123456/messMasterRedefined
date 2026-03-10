const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const WasteLog = require('../models/WasteLog');
const MenuItem = require('../models/MenuItem');

router.use(verifyToken, requireRole('staff'));

router.get('/', async (req, res, next) => {
  try {
    const { startDate, endDate, meal, limit = 50 } = req.query;
    const query = { messId: req.user.messId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (meal) query.meal = meal;

    const logs = await WasteLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('menuItemId', 'name')
      .populate('loggedBy', 'name');
    res.json({ logs, total: logs.length });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { menuItemId, meal, wastedKg, preparedKg } = req.body;
    if (!menuItemId || !meal || !wastedKg || !preparedKg) {
      return res.status(400).json({ error: 'menuItemId, meal, wastedKg, preparedKg are required' });
    }

    const approvedItem = await MenuItem.findOne({
      _id: menuItemId,
      messId: req.user.messId,
      isActive: true,
    });
    if (!approvedItem) {
      return res.status(400).json({ error: 'Invalid or unapproved menu item selected' });
    }

    const log = new WasteLog({
      messId: req.user.messId,
      loggedBy: req.user._id,
      meal,
      menuItemId: approvedItem._id,
      menuItemName: approvedItem.name,
      wastedKg: Number(wastedKg),
      preparedKg: Number(preparedKg),
      date: new Date(),
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) { next(err); }
});

router.get('/weekly', async (req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logs = await WasteLog.aggregate([
      { $match: { messId: req.user.messId, date: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          wastedKg: { $sum: '$wastedKg' },
          preparedKg: { $sum: '$preparedKg' },
          costLoss: { $sum: '$costLoss' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(logs);
  } catch (err) { next(err); }
});

router.get('/by-menu', async (req, res, next) => {
  try {
    const data = await WasteLog.aggregate([
      { $match: { messId: req.user.messId } },
      { $group: { _id: '$menuItemName', totalWaste: { $sum: '$wastedKg' }, count: { $sum: 1 } } },
      { $sort: { totalWaste: -1 } },
      { $limit: 10 },
    ]);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/by-meal', async (req, res, next) => {
  try {
    const data = await WasteLog.aggregate([
      { $match: { messId: req.user.messId } },
      { $group: { _id: '$meal', totalWaste: { $sum: '$wastedKg' }, avgWaste: { $avg: '$wastedKg' } } },
    ]);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
// Already defined above - this is a no-op comment
