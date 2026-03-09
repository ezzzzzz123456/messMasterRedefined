const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const Feedback = require('../models/Feedback');
const Mess = require('../models/Mess');
const User = require('../models/User');

// POST - student submits feedback
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { meal, overall, taste, portion, freshness, comment, selectedDate } = req.body;
    let messId = req.user.messId;

    // Handle newly registered students with no mess assignment yet.
    if (!messId) {
      const activeMess = await Mess.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (!activeMess) {
        return res.status(400).json({ error: 'No active mess found for feedback submission' });
      }
      messId = activeMess._id;
      await User.findByIdAndUpdate(req.user._id, { messId });
      req.user.messId = messId;
    }

    const feedback = await Feedback.create({
      messId,
      studentId: req.user._id,
      date: selectedDate ? new Date(selectedDate) : new Date(),
      meal,
      overallRating: overall || 3,
      tasteRating: taste || 3,
      portionRating: portion || 3,
      freshnessRating: freshness || 3,
      comment,
    });
    res.status(201).json(feedback);
  } catch (err) { next(err); }
});

// GET /my-history - student history for meal selections and past feedback
router.get('/my-history', verifyToken, requireRole('student'), async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ studentId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(100)
      .select('date meal overallRating tasteRating portionRating freshnessRating comment createdAt');

    res.json({ history: feedback });
  } catch (err) { next(err); }
});

// GET /summary - aggregated ratings
router.get('/summary', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const result = await Feedback.aggregate([
      { $match: { messId: req.user.messId } },
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$overallRating' },
          avgTaste: { $avg: '$tasteRating' },
          avgPortion: { $avg: '$portionRating' },
          avgFreshness: { $avg: '$freshnessRating' },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(result[0] || { avgOverall: 0, avgTaste: 0, avgPortion: 0, avgFreshness: 0, count: 0 });
  } catch (err) { next(err); }
});

// GET /recent
router.get('/recent', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ messId: req.user.messId })
      .sort({ createdAt: -1 }).limit(20)
      .populate('studentId', 'name rollNo');
    // Map field names for frontend
    const mapped = feedback.map(f => ({
      ...f.toObject(),
      overall: f.overallRating,
      taste: f.tasteRating,
      portion: f.portionRating,
      freshness: f.freshnessRating,
      student: f.studentId,
    }));
    res.json({ feedback: mapped });
  } catch (err) { next(err); }
});

// GET /
router.get('/', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ messId: req.user.messId })
      .sort({ createdAt: -1 }).populate('studentId', 'name rollNo');
    res.json(feedback);
  } catch (err) { next(err); }
});

module.exports = router;
