const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const Inventory = require('../models/Inventory');
const EnergyLog = require('../models/EnergyLog');

router.use(verifyToken, requireRole('staff'));

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { messId: req.user.messId };
    if (category) query.category = category;
    const items = await Inventory.find(query).sort({ category: 1, name: 1 });
    res.json({ items, total: items.length });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.qty !== undefined && payload.quantity === undefined) payload.quantity = payload.qty;
    if (payload.minQty !== undefined && payload.minQuantity === undefined) payload.minQuantity = payload.minQty;
    const item = await Inventory.create({ ...payload, messId: req.user.messId });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.get('/reorder-suggestions', async (req, res, next) => {
  try {
    const items = await Inventory.find({
      messId: req.user.messId,
      $expr: { $lte: ['$quantity', '$minQuantity'] },
    }).sort({ category: 1, name: 1 });

    const suggestions = items.map(item => {
      const reorderQty = Math.max(0, Number(((item.minQuantity * 3) - item.quantity).toFixed(2)));
      return {
        _id: item._id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        reorderQty,
      };
    }).filter(s => s.reorderQty > 0);

    res.json({ suggestions, count: suggestions.length });
  } catch (err) { next(err); }
});

router.post('/authorize-reorder', async (req, res, next) => {
  try {
    const { items } = req.body;
    const payload = Array.isArray(items) ? items : [];

    const lowStockItems = await Inventory.find({
      messId: req.user.messId,
      $expr: { $lte: ['$quantity', '$minQuantity'] },
    });

    const defaultMap = new Map(lowStockItems.map(item => [
      String(item._id),
      Math.max(0, Number(((item.minQuantity * 3) - item.quantity).toFixed(2))),
    ]));

    const updatePlan = payload.length
      ? payload.map(i => ({ id: String(i.id || i._id), qty: Number(i.quantity || i.reorderQty || 0) }))
      : [...defaultMap.entries()].map(([id, qty]) => ({ id, qty }));

    let updated = 0;
    for (const row of updatePlan) {
      if (!row.id || row.qty <= 0) continue;
      const item = await Inventory.findOne({ _id: row.id, messId: req.user.messId });
      if (!item) continue;
      item.quantity = Number((item.quantity + row.qty).toFixed(2));
      await item.save();
      updated += 1;
    }

    res.json({ message: 'Authorized reorder applied', updated });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.qty !== undefined && payload.quantity === undefined) payload.quantity = payload.qty;
    if (payload.minQty !== undefined && payload.minQuantity === undefined) payload.minQuantity = payload.minQty;
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, messId: req.user.messId },
      payload,
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Inventory.findOneAndDelete({ _id: req.params.id, messId: req.user.messId });
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted', id: deleted._id });
  } catch (err) { next(err); }
});

router.get('/low-stock', async (req, res, next) => {
  try {
    const items = await Inventory.find({ messId: req.user.messId, $expr: { $lte: ['$quantity', '$minQuantity'] } });
    res.json({ items });
  } catch (err) { next(err); }
});

router.post('/energy-log', async (req, res, next) => {
  try {
    const log = new EnergyLog({ ...req.body, messId: req.user.messId, loggedBy: req.user._id });
    await log.save();
    res.status(201).json(log);
  } catch (err) { next(err); }
});

router.get('/energy-summary', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayLog] = await EnergyLog.find({ messId: req.user.messId, date: { $gte: today } }).sort({ date: -1 }).limit(1);
    const mtdLogs = await EnergyLog.find({ messId: req.user.messId, date: { $gte: monthStart } });

    const mtd = mtdLogs.reduce((acc, l) => ({
      gasKg: acc.gasKg + l.gasKg,
      electricityKwh: acc.electricityKwh + l.electricityKwh,
      gasCost: acc.gasCost + l.gasCost,
      electricityCost: acc.electricityCost + l.electricityCost,
    }), { gasKg: 0, electricityKwh: 0, gasCost: 0, electricityCost: 0 });

    res.json({ today: todayLog || null, mtd });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.qty !== undefined && payload.quantity === undefined) payload.quantity = payload.qty;
    if (payload.minQty !== undefined && payload.minQuantity === undefined) payload.minQuantity = payload.minQty;
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, messId: req.user.messId },
      payload,
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) { next(err); }
});

module.exports = router;
