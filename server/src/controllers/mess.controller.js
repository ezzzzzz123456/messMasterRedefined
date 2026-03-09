const Mess = require('../models/Mess');
const WasteLog = require('../models/WasteLog');
const User = require('../models/User');

exports.create = async (req, res, next) => {
  try {
    const { name, capacity, established, phone, location, pointOfContact, representative } = req.body;
    const mess = await Mess.create({
      name,
      capacity,
      established,
      phone,
      location,
      pointOfContact,
      representative,
      adminUserId: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, { messId: mess._id, isSetupComplete: true });

    res.status(201).json(mess);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) return res.status(404).json({ error: 'Mess not found' });
    res.json(mess);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const mess = await Mess.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mess) return res.status(404).json({ error: 'Mess not found' });
    res.json(mess);
  } catch (err) {
    next(err);
  }
};

exports.dashboardSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const logs = await WasteLog.find({ messId: id, date: { $gte: weekAgo } });

    const totalWaste = logs.reduce((sum, l) => sum + l.wastedKg, 0);
    const totalCost = logs.reduce((sum, l) => sum + l.costLoss, 0);
    const totalCo2 = logs.reduce((sum, l) => sum + l.co2Kg, 0);

    res.json({
      totalWasteKg: parseFloat(totalWaste.toFixed(2)),
      totalCostLoss: parseFloat(totalCost.toFixed(2)),
      totalCo2Kg: parseFloat(totalCo2.toFixed(2)),
      logCount: logs.length,
    });
  } catch (err) {
    next(err);
  }
};
