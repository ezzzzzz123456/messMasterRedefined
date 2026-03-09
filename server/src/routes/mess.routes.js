const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const messController = require('../controllers/mess.controller');

router.use(verifyToken);

// GET /mess/me - get current user's mess
router.get('/me', async (req, res, next) => {
  try {
    const Mess = require('../models/Mess');
    if (!req.user.messId) return res.status(404).json({ error: 'No mess associated' });
    const mess = await Mess.findById(req.user.messId);
    if (!mess) return res.status(404).json({ error: 'Mess not found' });
    res.json(mess);
  } catch (err) { next(err); }
});

// PATCH /mess/me - update current user's mess
router.patch('/me', requireRole('staff'), async (req, res, next) => {
  try {
    const Mess = require('../models/Mess');
    const mess = await Mess.findByIdAndUpdate(req.user.messId, req.body, { new: true });
    res.json(mess);
  } catch (err) { next(err); }
});

router.post('/', requireRole('staff'), messController.create);
router.get('/:id', messController.getById);
router.put('/:id', requireRole('staff'), messController.update);
router.get('/:id/dashboard-summary', messController.dashboardSummary);

module.exports = router;
