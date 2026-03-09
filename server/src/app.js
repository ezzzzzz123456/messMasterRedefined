const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const messRoutes = require('./routes/mess.routes');
const menuRoutes = require('./routes/menu.routes');
const staffRoutes = require('./routes/staff.routes');
const wasteRoutes = require('./routes/waste.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const oracleRoutes = require('./routes/oracle.routes');
const reviewRoutes = require('./routes/review.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const listingRoutes = require('./routes/listing.routes');
const requestRoutes = require('./routes/request.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Security
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/mess', messRoutes);
app.use('/api/v1/menu-items', menuRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/waste-logs', wasteRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/oracle', oracleRoutes);
app.use('/api/v1/cook-reviews', reviewRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/requests', requestRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', version: '1.0.0', app: 'MessMaster' });
});

app.use(errorMiddleware);

module.exports = app;
