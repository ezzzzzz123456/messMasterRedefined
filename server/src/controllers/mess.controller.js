const Mess = require('../models/Mess');
const WasteLog = require('../models/WasteLog');
const User = require('../models/User');
const { geocodeLocation } = require('../services/geocoding.service');

exports.create = async (req, res, next) => {
  try {
    const { name, capacity, established, phone, location, adminContact, pointOfContact, representative } = req.body;
    let resolvedLocation = null;
    if (location) {
      try {
        resolvedLocation = await geocodeLocation(location);
      } catch (error) {
        return res.status(502).json({ error: 'Location lookup failed. Please try again shortly.' });
      }
      if (!resolvedLocation) {
        return res.status(400).json({ error: 'Enter a valid mess location that can be resolved on the map' });
      }
    }

    const mess = await Mess.create({
      name,
      capacity,
      established,
      phone,
      location: resolvedLocation?.displayName || location,
      latitude: resolvedLocation?.latitude,
      longitude: resolvedLocation?.longitude,
      adminContact: adminContact || representative || pointOfContact,
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
    const payload = { ...req.body };
    if (payload.location) {
      let resolvedLocation = null;
      try {
        resolvedLocation = await geocodeLocation(payload.location);
      } catch (error) {
        return res.status(502).json({ error: 'Location lookup failed. Please try again shortly.' });
      }
      if (!resolvedLocation) {
        return res.status(400).json({ error: 'Enter a valid mess location that can be resolved on the map' });
      }
      payload.location = resolvedLocation.displayName;
      payload.latitude = resolvedLocation.latitude;
      payload.longitude = resolvedLocation.longitude;
      payload.geo = {
        type: 'Point',
        coordinates: [resolvedLocation.longitude, resolvedLocation.latitude],
      };
    }

    const mess = await Mess.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
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
