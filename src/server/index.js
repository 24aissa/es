require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const connectDB = require('./config/database');
const i18n = require('./config/i18n');
const errorHandler = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const { initializeSchedulers } = require('./services/notificationService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const childRoutes = require('./routes/children');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const workerRoutes = require('./routes/workers');
const deliveryRoutes = require('./routes/delivery');
const customerServiceRoutes = require('./routes/customerService');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Initialize notification schedulers
initializeSchedulers();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://babyvibe.dz', 'https://www.babyvibe.dz']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// i18n middleware
app.use(i18n.init);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/children', childRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/customer-service', customerServiceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: require('../../package.json').version
  });
});

// Serve client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: req.t('error.notFound'),
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BabyVibe server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌍 Default language: ${process.env.DEFAULT_LANGUAGE || 'ar'}`);
});

module.exports = app;