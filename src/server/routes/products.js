const express = require('express');
const Product = require('../models/Product');
const { optionalAuth, protect, authorize } = require('../middleware/auth');
const { browsingRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', browsingRateLimiter, optionalAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.subcategory) filter.subcategory = req.query.subcategory;
    if (req.query.gender && req.query.gender !== 'all') {
      filter['specifications.gender'] = { $in: [req.query.gender, 'unisex'] };
    }
    if (req.query.season && req.query.season !== 'all') {
      filter.season = { $in: [req.query.season, 'all-season'] };
    }

    // Age filtering
    if (req.query.ageInMonths) {
      const ageInMonths = parseInt(req.query.ageInMonths);
      filter['ageRange.minMonths'] = { $lte: ageInMonths };
      filter['ageRange.maxMonths'] = { $gte: ageInMonths };
    }

    // Price filtering
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseInt(req.query.maxPrice);
    }

    // Search query
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort
    let sort = {};
    switch (req.query.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { isFeatured: -1, 'rating.average': -1, createdAt: -1 };
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await Product.countDocuments(filter);

    // Get user's preferred language for localized content
    const language = req.user?.preferredLanguage || req.query.lang || 'ar';

    // Transform products for response
    const transformedProducts = products.map(product => ({
      ...product.toJSON(),
      localizedName: product.getLocalizedName(language),
      localizedDescription: product.getLocalizedDescription(language)
    }));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transformedProducts
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', browsingRateLimiter, optionalAuth, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: req.t('error.productNotFound')
      });
    }

    const language = req.user?.preferredLanguage || req.query.lang || 'ar';

    const transformedProduct = {
      ...product.toJSON(),
      localizedName: product.getLocalizedName(language),
      localizedDescription: product.getLocalizedDescription(language)
    };

    res.status(200).json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: req.t('product.createSuccess'),
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: req.user._id
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: req.t('error.productNotFound')
      });
    }

    res.status(200).json({
      success: true,
      message: req.t('product.updateSuccess'),
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: req.t('error.productNotFound')
      });
    }

    res.status(200).json({
      success: true,
      message: req.t('product.deleteSuccess')
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
router.get('/categories/list', browsingRateLimiter, async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    const subcategories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', subcategories: { $addToSet: '$subcategory' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories,
        subcategories: subcategories.reduce((acc, item) => {
          acc[item._id] = item.subcategories;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: req.t('error.invalidRating')
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: req.t('error.productNotFound')
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.date = new Date();
    } else {
      // Add new review
      product.reviews.push({
        user: req.user._id,
        rating,
        comment
      });
    }

    // Update product rating
    product.updateRating();
    await product.save();

    res.status(200).json({
      success: true,
      message: req.t('product.reviewAdded'),
      data: product
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;