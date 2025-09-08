const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('children');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'profileImage', 
      'preferredLanguage', 'addresses', 'notificationSettings'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: req.t('user.profileUpdated'),
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user language preference
// @route   PUT /api/users/language
// @access  Private
router.put('/language', protect, async (req, res, next) => {
  try {
    const { language } = req.body;

    if (!['ar', 'fr', 'dz'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: req.t('error.invalidLanguage')
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferredLanguage: language },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: req.t('user.languageUpdated'),
      data: { preferredLanguage: user.preferredLanguage }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
router.post('/addresses', protect, async (req, res, next) => {
  try {
    const { street, city, province, postalCode, isDefault } = req.body;

    if (!street || !city || !province) {
      return res.status(400).json({
        success: false,
        message: req.t('error.requiredAddressFields')
      });
    }

    const user = await User.findById(req.user._id);

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      street,
      city,
      province,
      postalCode,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: req.t('user.addressAdded'),
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
router.delete('/addresses/:addressId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === req.params.addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: req.t('error.addressNotFound')
      });
    }

    user.addresses.splice(addressIndex, 1);

    // If this was the default address and there are other addresses, make the first one default
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: req.t('user.addressDeleted'),
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;