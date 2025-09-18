const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { smsService } = require('../services/smsService');
const { customerServiceService } = require('../services/customerServiceService');

// @desc    Get all orders for user
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user.id };
    
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      deliveryProvider,
      specialInstructions,
      promoCode
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const Product = require('../models/Product');
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        size: item.size,
        price: product.price,
        productSnapshot: {
          name: product.name.ar,
          image: product.images[0],
          sku: product.sku
        }
      });
    }

    // Calculate shipping, tax, and total
    const shipping = 500; // Default shipping cost
    const tax = 0;
    const total = subtotal + shipping + tax;

    // Create order
    const orderData = {
      user: req.user.id,
      items: processedItems,
      totals: {
        subtotal,
        shipping,
        tax,
        total
      },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentInfo: {
        method: paymentMethod || 'cod'
      },
      delivery: {
        provider: deliveryProvider || 'dzexpress'
      },
      specialInstructions,
      promoCode,
      // Initialize customer service fields
      confirmation: {
        status: 'pending',
        priority: 'normal',
        attempts: []
      },
      duplicateInfo: {
        isDuplicate: false
      },
      smsHistory: []
    };

    const order = new Order(orderData);
    
    // Check for duplicates automatically
    const duplicateCheck = await order.checkForDuplicates();
    if (duplicateCheck.isDuplicate) {
      // Don't auto-reject duplicates, but flag them for review
      console.log(`⚠️ Potential duplicate order detected: ${order.orderNumber}`);
    }

    await order.save();

    // Update customer classification
    const customer = await User.findById(req.user.id);
    await customer.updateCustomerClassification();

    // Send initial SMS
    try {
      await smsService.sendConfirmationSMS(order, 'assigned');
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Don't fail the order creation if SMS fails
    }

    // Populate the response
    await order.populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name images price')
      .populate('confirmation.assignedAgent', 'firstName lastName')
      .populate('confirmation.attempts.agent', 'firstName lastName')
      .populate('statusHistory.updatedBy', 'firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or has permission
    if (order.user._id.toString() !== req.user.id && 
        !['admin', 'supervisor', 'worker'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin, Supervisor, Worker)
router.put('/:id/status', protect, authorize('admin', 'supervisor', 'worker'), async (req, res, next) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.updateStatus(status, note, req.user.id);

    // Send SMS notification for important status changes
    if (['confirmed', 'shipped', 'delivered'].includes(status)) {
      try {
        await smsService.sendConfirmationSMS(order, status);
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or has permission
    if (order.user.toString() !== req.user.id && 
        !['admin', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.cancellationReason = reason;
    await order.updateStatus('cancelled', `Order cancelled: ${reason}`, req.user.id);

    // Update customer classification (cancellation affects score)
    const customer = await User.findById(order.user);
    await customer.updateCustomerClassification();

    // Send cancellation SMS
    try {
      await smsService.sendConfirmationSMS(order, 'cancelled');
    } catch (smsError) {
      console.error('SMS notification failed:', smsError);
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all orders (Admin/Supervisor)
// @route   GET /api/orders/admin/all
// @access  Private (Admin, Supervisor)
router.get('/admin/all', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      confirmationStatus,
      dateFrom,
      dateTo,
      search
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (confirmationStatus) filter['confirmation.status'] = confirmationStatus;
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email phone customerClassification')
      .populate('confirmation.assignedAgent', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;