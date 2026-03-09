const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Mess = require('../models/Mess');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');
const Staff = require('../models/Staff');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role, messId, rollNo, year } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedRole = String(role || 'student').trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    let resolvedMessId = messId;
    if (normalizedRole === 'student' && !resolvedMessId) {
      const activeMess = await Mess.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (activeMess) resolvedMessId = activeMess._id;
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: normalizedRole,
      messId: resolvedMessId,
      rollNo,
      year: year ? Number(year) : undefined,
    });
    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({ accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

exports.registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, rollNo, year, messId } = req.body;

    if (!name || !email || !password || !rollNo || !year || !messId) {
      return res.status(400).json({ error: 'name, email, password, rollNo, year, messId are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const mess = await Mess.findById(messId);
    if (!mess) return res.status(404).json({ error: 'Selected mess not found' });

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'student',
      messId: mess._id,
      rollNo,
      year: Number(year),
      isSetupComplete: true,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({ accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

exports.registerNgo = async (req, res, next) => {
  try {
    const { ngoName, location, email, password } = req.body;
    if (!ngoName || !location || !email || !password) {
      return res.status(400).json({ error: 'ngoName, location, email, password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({
      name: ngoName,
      organizationName: ngoName,
      location,
      email: normalizedEmail,
      password,
      role: 'ngo',
      isSetupComplete: true,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    res.status(201).json({ accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

exports.registerMess = async (req, res, next) => {
  try {
    const {
      messName, phoneNumber, location, messCapacity,
      numberOfMenuItems, menuItems = [],
      inventoryItems = [],
      cooks = [],
      adminName, adminEmail, adminPassword,
      pocName, pocPhone,
      repName, repEmail, repPhone,
    } = req.body;

    if (!messName || !phoneNumber || !location || !adminName || !adminEmail || !adminPassword || !pocName || !pocPhone || !repName || !repEmail || !repPhone) {
      return res.status(400).json({ error: 'Missing required mess registration fields' });
    }

    const normalizedAdminEmail = String(adminEmail).trim().toLowerCase();
    const normalizedRepEmail = String(repEmail).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedAdminEmail });
    if (existing) return res.status(400).json({ error: 'Admin email already registered' });

    let adminUser = null;
    let mess = null;
    const cleanMenuItems = Array.isArray(menuItems) ? menuItems.filter(Boolean).map(String).map(s => s.trim()).filter(Boolean) : [];
    const menuLimit = Number(numberOfMenuItems) > 0 ? Number(numberOfMenuItems) : cleanMenuItems.length;
    const finalMenuItems = cleanMenuItems.slice(0, menuLimit);
    const finalInventory = Array.isArray(inventoryItems) ? inventoryItems : [];
    const finalCooks = Array.isArray(cooks) ? cooks : [];

    adminUser = await User.create({
      name: adminName,
      email: normalizedAdminEmail,
      password: adminPassword,
      role: 'staff',
      isSetupComplete: true,
    });

    mess = await Mess.create({
      name: messName,
      phone: phoneNumber,
      location,
      capacity: messCapacity ? Number(messCapacity) : undefined,
      adminUserId: adminUser._id,
      pointOfContact: { name: pocName, phone: pocPhone },
      representative: { name: repName, email: normalizedRepEmail, phone: repPhone },
      isActive: true,
    });

    adminUser.messId = mess._id;
    await adminUser.save();

    if (finalMenuItems.length) {
      await MenuItem.insertMany(finalMenuItems.map(item => ({
        messId: mess._id,
        name: item,
        category: 'Main Course',
        avgWasteKg: 0,
        isActive: true,
      })));
    }

    const normalizedInventory = finalInventory
      .filter(item => item && item.name && item.category && item.unit)
      .map(item => ({
        messId: mess._id,
        name: String(item.name).trim(),
        category: String(item.category).trim(),
        unit: String(item.unit).trim(),
        quantity: Number(item.quantity) || 0,
        minQuantity: Number(item.minimumQuantity) || 0,
      }));
    if (normalizedInventory.length) await Inventory.insertMany(normalizedInventory);

    const normalizedCooks = finalCooks
      .filter(cook => cook && cook.name && cook.role)
      .map(cook => ({
        messId: mess._id,
        name: String(cook.name).trim(),
        role: String(cook.role).trim(),
        contactNumber: cook.contactNumber ? String(cook.contactNumber).trim() : '',
        isActive: true,
      }));
    if (normalizedCooks.length) await Staff.insertMany(normalizedCooks);

    const { accessToken, refreshToken } = generateTokens(adminUser._id);
    adminUser.refreshToken = refreshToken;
    await adminUser.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: adminUser,
      mess,
      stats: {
        menuItemsCreated: finalMenuItems.length,
        inventoryItemsCreated: finalInventory.length,
        cooksCreated: finalCooks.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.listMessesForRegistration = async (req, res, next) => {
  try {
    const messes = await Mess.find({ isActive: true })
      .select('_id name location capacity')
      .sort({ name: 1 });
    res.json({ messes });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  res.json(req.user);
};
