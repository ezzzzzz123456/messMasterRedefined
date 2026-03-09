const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const CookReview = require('../models/CookReview');
const Staff = require('../models/Staff');
const WasteLog = require('../models/WasteLog');
const Feedback = require('../models/Feedback');
const geminiService = require('../services/gemini.service');

const getGrade = (score) => {
  if (score >= 9) return 'A+';
  if (score >= 8) return 'A';
  if (score >= 7) return 'B+';
  if (score >= 6) return 'B';
  return 'C';
};

router.get('/:date', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const date = new Date(req.params.date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Check cache
    const cached = await CookReview.find({
      messId: req.user.messId,
      date: { $gte: date, $lt: endDate },
    }).populate('staffId');

    if (cached.length > 0) return res.json(cached);

    // Generate reviews
    const staffList = await Staff.find({ messId: req.user.messId, isActive: true });
    const wasteLogs = await WasteLog.find({
      messId: req.user.messId,
      date: { $gte: date, $lt: endDate },
    });

    const feedbackData = await Feedback.find({
      messId: req.user.messId,
      date: { $gte: date, $lt: endDate },
    });

    const avgFeedbackRating = feedbackData.length > 0
      ? feedbackData.reduce((s, f) => s + f.overallRating, 0) / feedbackData.length
      : 3.5;

    const reviews = [];
    for (const staff of staffList) {
      const staffLogs = wasteLogs.filter((_, i) => i % staffList.length === staffList.indexOf(staff));
      const dishes = staffLogs.map(log => ({
        menuItemName: log.menuItemName,
        preparedKg: log.preparedKg,
        wastedKg: log.wastedKg,
        studentRating: avgFeedbackRating,
        onTime: Math.random() > 0.2,
      }));

      const wasteRatio = dishes.length > 0
        ? dishes.reduce((s, d) => s + (d.wastedKg / d.preparedKg), 0) / dishes.length
        : 0.15;
      const onTimeScore = dishes.length > 0
        ? dishes.filter(d => d.onTime).length / dishes.length
        : 0.8;
      const compositeScore = parseFloat(((avgFeedbackRating / 5 * 4) + ((1 - wasteRatio) * 4) + (onTimeScore * 2)).toFixed(1));
      const grade = getGrade(compositeScore);

      const aiReviewText = await geminiService.generateCookReview({
        name: staff.name, role: staff.role, dishes, compositeScore, grade,
      });

      const review = await CookReview.create({
        messId: req.user.messId,
        staffId: staff._id,
        date,
        dishes,
        wasteRatio: parseFloat(wasteRatio.toFixed(3)),
        avgRating: parseFloat(avgFeedbackRating.toFixed(1)),
        onTimeScore: parseFloat(onTimeScore.toFixed(2)),
        compositeScore,
        grade,
        aiReviewText,
        generatedAt: new Date(),
      });

      reviews.push({ ...review.toObject(), staffId: staff });
    }

    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

router.get('/staff/:staffId', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const reviews = await CookReview.find({ staffId: req.params.staffId })
      .sort({ date: -1 })
      .limit(30)
      .populate('staffId');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
