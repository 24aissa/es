const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const { email, phone, password, firstName, lastName, preferredLanguage } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: req.t('auth.userExists')
      });
    }

    // Create user
    const user = await User.create({
      email,
      phone,
      password,
      firstName,
      lastName,
      preferredLanguage: preferredLanguage || 'ar'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: req.t('auth.registerSuccess'),
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: req.t('auth.provideEmailPassword')
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: req.t('auth.invalidCredentials')
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: req.t('auth.accountDeactivated')
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: req.t('auth.loginSuccess'),
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', require('../middleware/auth').protect, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: req.t('auth.logoutSuccess')
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', authRateLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: req.t('auth.userNotFound')
      });
    }

    // TODO: Implement password reset email
    // For now, just return a success message
    res.status(200).json({
      success: true,
      message: req.t('auth.passwordResetSent')
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Private
router.post('/verify-email', require('../middleware/auth').protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.emailVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: req.t('auth.emailVerified')
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify phone
// @route   POST /api/auth/verify-phone
// @access  Private
router.post('/verify-phone', require('../middleware/auth').protect, async (req, res, next) => {
  try {
    const { code } = req.body;
    
    // TODO: Implement actual SMS verification
    // For now, just mark as verified
    const user = await User.findById(req.user.id);
    user.phoneVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: req.t('auth.phoneVerified')
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;