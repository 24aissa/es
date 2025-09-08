const express = require('express');
const Child = require('../models/Child');
const { protect, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all children for logged in user
// @route   GET /api/children
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const children = await Child.find({ 
      parent: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: children.length,
      data: children
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single child
// @route   GET /api/children/:id
// @access  Private
router.get('/:id', protect, checkOwnership('parent'), async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: req.t('error.childNotFound')
      });
    }

    // Check ownership for non-admin users
    if (req.checkOwnership && !child.parent.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: req.t('error.notAuthorized')
      });
    }

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new child
// @route   POST /api/children
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, gender, birthDate, avatar, measurements, preferences } = req.body;

    // Validate required fields
    if (!name || !gender || !birthDate) {
      return res.status(400).json({
        success: false,
        message: req.t('error.requiredFields')
      });
    }

    // Validate birth date is not in the future
    if (new Date(birthDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: req.t('error.invalidBirthDate')
      });
    }

    const child = await Child.create({
      name,
      gender,
      birthDate,
      avatar,
      measurements,
      preferences,
      parent: req.user._id
    });

    // Set current size recommendations based on age
    child.currentSizes = {
      clothing: child.getRecommendedClothingSize(),
      shoes: 'TBD', // To be determined based on measurements
      diapers: 'TBD'
    };

    await child.save();

    res.status(201).json({
      success: true,
      message: req.t('child.createSuccess'),
      data: child
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update child
// @route   PUT /api/children/:id
// @access  Private
router.put('/:id', protect, checkOwnership('parent'), async (req, res, next) => {
  try {
    let child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: req.t('error.childNotFound')
      });
    }

    // Check ownership for non-admin users
    if (req.checkOwnership && !child.parent.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: req.t('error.notAuthorized')
      });
    }

    const allowedUpdates = ['name', 'avatar', 'measurements', 'preferences', 'currentSizes'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    child = await Child.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: req.t('child.updateSuccess'),
      data: child
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete child (soft delete)
// @route   DELETE /api/children/:id
// @access  Private
router.delete('/:id', protect, checkOwnership('parent'), async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: req.t('error.childNotFound')
      });
    }

    // Check ownership for non-admin users
    if (req.checkOwnership && !child.parent.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: req.t('error.notAuthorized')
      });
    }

    // Soft delete
    child.isActive = false;
    await child.save();

    res.status(200).json({
      success: true,
      message: req.t('child.deleteSuccess')
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get age-appropriate products for child
// @route   GET /api/children/:id/recommendations
// @access  Private
router.get('/:id/recommendations', protect, checkOwnership('parent'), async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: req.t('error.childNotFound')
      });
    }

    // Check ownership for non-admin users
    if (req.checkOwnership && !child.parent.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: req.t('error.notAuthorized')
      });
    }

    const Product = require('../models/Product');
    
    // Get products suitable for child's age
    const ageInMonths = child.ageInMonths;
    const recommendations = await Product.find({
      'ageRange.minMonths': { $lte: ageInMonths },
      'ageRange.maxMonths': { $gte: ageInMonths },
      isActive: true
    }).limit(20).sort({ rating: -1, isFeatured: -1 });

    res.status(200).json({
      success: true,
      data: {
        child: {
          id: child._id,
          name: child.name,
          age: child.age,
          ageInMonths: child.ageInMonths
        },
        recommendations,
        categories: child.getAgeAppropriateCategories()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update size alert for child
// @route   POST /api/children/:id/size-alert
// @access  Private
router.post('/:id/size-alert', protect, checkOwnership('parent'), async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: req.t('error.childNotFound')
      });
    }

    // Check ownership for non-admin users
    if (req.checkOwnership && !child.parent.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: req.t('error.notAuthorized')
      });
    }

    await child.updateSizeAlert();

    res.status(200).json({
      success: true,
      message: req.t('child.sizeAlertUpdated'),
      data: child
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add size to history
// @route   POST /api/children/:id/size-history
// @access  Private
router.post('/:id/size-history', protect, checkOwnership('parent'), async (req, res, next) => {
  try {
    const { category, size } = req.body;

    if (!category || !size) {
      return res.status(400).json({
        success: false,
        message: req.t('error.requiredFields')
      });
    }

    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: req.t('error.childNotFound')
      });
    }

    // Check ownership for non-admin users
    if (req.checkOwnership && !child.parent.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: req.t('error.notAuthorized')
      });
    }

    child.sizeHistory.push({
      category,
      size,
      ageInMonths: child.ageInMonths
    });

    // Update current size
    child.currentSizes[category] = size;

    await child.save();

    res.status(200).json({
      success: true,
      message: req.t('child.sizeHistoryAdded'),
      data: child
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;