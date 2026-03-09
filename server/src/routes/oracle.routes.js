const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const oracleService = require('../services/oracle.service');

router.post('/predict', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const { menu, meal, day, weather, event } = req.body;
    if (!menu || !meal || !day || !weather || !event) {
      return res.status(400).json({ error: 'All prediction parameters are required' });
    }

    if (!req.user.messId) {
      return res.status(400).json({ error: 'Staff user is not linked to a mess' });
    }

    const result = await oracleService.predict({
      messId: req.user.messId,
      menu,
      meal,
      day,
      weather,
      event,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
