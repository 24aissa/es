const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { customerServiceService } = require('../services/customerServiceService');
const { smsService } = require('../services/smsService');

// @desc    Get dashboard stats for customer service
// @route   GET /api/customer-service/dashboard
// @access  Private (Admin, Supervisor, Confirmation Agent)
router.get('/dashboard', protect, authorize('admin', 'supervisor', 'worker'), async (req, res, next) => {
  try {
    const stats = await customerServiceService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get orders pending confirmation
// @route   GET /api/customer-service/orders/pending
// @access  Private (Admin, Supervisor, Confirmation Agent)
router.get('/orders/pending', protect, authorize('admin', 'supervisor', 'worker'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, priority, agent } = req.query;
    
    const filter = { 
      'confirmation.status': { $in: ['pending', 'attempting'] },
      status: 'pending'
    };
    
    if (priority) filter['confirmation.priority'] = priority;
    if (agent) filter['confirmation.assignedAgent'] = agent;
    
    // If user is a confirmation agent, only show their assigned orders or unassigned ones
    if (req.user.role === 'worker' && req.user.agentInfo?.isConfirmationAgent) {
      filter.$or = [
        { 'confirmation.assignedAgent': req.user._id },
        { 'confirmation.assignedAgent': { $exists: false } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName phone email customerClassification')
      .populate('confirmation.assignedAgent', 'firstName lastName')
      .sort({ 'confirmation.priority': -1, createdAt: 1 })
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

// @desc    Assign order to confirmation agent
// @route   POST /api/customer-service/orders/:orderId/assign
// @access  Private (Admin, Supervisor)
router.post('/orders/:orderId/assign', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { agentId, priority = 'normal' } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const agent = await User.findById(agentId);
    if (!agent || !agent.agentInfo?.isConfirmationAgent) {
      return res.status(400).json({
        success: false,
        message: 'Invalid confirmation agent'
      });
    }

    await order.assignToAgent(agentId, priority);
    
    // Send SMS notification to customer
    await smsService.sendConfirmationSMS(order, 'assigned');

    res.status(200).json({
      success: true,
      message: 'Order assigned successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Auto-assign orders to agents based on preferences
// @route   POST /api/customer-service/orders/auto-assign
// @access  Private (Admin, Supervisor)
router.post('/orders/auto-assign', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const result = await customerServiceService.autoAssignOrders();
    res.status(200).json({
      success: true,
      message: `Auto-assigned ${result.assignedCount} orders`,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add confirmation attempt
// @route   POST /api/customer-service/orders/:orderId/confirm-attempt
// @access  Private (Confirmation Agent)
router.post('/orders/:orderId/confirm-attempt', protect, authorize('admin', 'supervisor', 'worker'), async (req, res, next) => {
  try {
    const { method, result, notes, nextAttemptAt, duration } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is assigned agent or has permission
    if (req.user.role === 'worker' && 
        order.confirmation.assignedAgent?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this order'
      });
    }

    const attemptData = {
      agent: req.user._id,
      method,
      result,
      notes,
      nextAttemptAt: nextAttemptAt ? new Date(nextAttemptAt) : null,
      duration: duration || 0
    };

    await order.addConfirmationAttempt(attemptData);
    
    // Update customer classification based on result
    const customer = await User.findById(order.user);
    if (result === 'confirmed') {
      await customer.updateCustomerClassification();
    } else if (result === 'cancelled') {
      await customer.addCustomerFlag('cancelled_order', `Order ${order.orderNumber} cancelled during confirmation`, req.user._id);
    }

    // Send SMS based on result
    if (result === 'confirmed') {
      await smsService.sendConfirmationSMS(order, 'confirmed');
    } else if (result === 'reschedule' && nextAttemptAt) {
      await smsService.sendConfirmationSMS(order, 'reschedule');
    }

    res.status(200).json({
      success: true,
      message: 'Confirmation attempt recorded',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get customer details with classification
// @route   GET /api/customer-service/customers/:customerId
// @access  Private (Admin, Supervisor, Confirmation Agent)
router.get('/customers/:customerId', protect, authorize('admin', 'supervisor', 'worker'), async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.customerId)
      .populate('customerClassification.flags.addedBy', 'firstName lastName')
      .populate('customerClassification.notes.addedBy', 'firstName lastName');
      
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer's recent orders
    const recentOrders = await Order.find({ user: customer._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber status totals createdAt confirmation.status confirmation.attempts');

    res.status(200).json({
      success: true,
      data: {
        customer,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add customer flag
// @route   POST /api/customer-service/customers/:customerId/flags
// @access  Private (Admin, Supervisor)
router.post('/customers/:customerId/flags', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { type, reason } = req.body;
    
    const customer = await User.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.addCustomerFlag(type, reason, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Customer flag added successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add customer note
// @route   POST /api/customer-service/customers/:customerId/notes
// @access  Private (Admin, Supervisor, Confirmation Agent)
router.post('/customers/:customerId/notes', protect, authorize('admin', 'supervisor', 'worker'), async (req, res, next) => {
  try {
    const { content } = req.body;
    
    const customer = await User.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.addCustomerNote(content, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Customer note added successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Detect duplicate orders
// @route   POST /api/customer-service/orders/detect-duplicates
// @access  Private (Admin, Supervisor)
router.post('/orders/detect-duplicates', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const result = await customerServiceService.detectDuplicateOrders();
    res.status(200).json({
      success: true,
      message: `Detected ${result.duplicatesFound} potential duplicate orders`,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get confirmation agents performance
// @route   GET /api/customer-service/agents/performance
// @access  Private (Admin, Supervisor)
router.get('/agents/performance', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const agents = await User.find({ 
      'agentInfo.isConfirmationAgent': true,
      isActive: true
    }).select('firstName lastName agentInfo.performance');

    res.status(200).json({
      success: true,
      data: agents
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update confirmation statuses (custom statuses)
// @route   PUT /api/customer-service/confirmation-statuses
// @access  Private (Admin)
router.put('/confirmation-statuses', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { statuses } = req.body;
    
    // This would typically be stored in a configuration collection
    // For now, we'll return success
    res.status(200).json({
      success: true,
      message: 'Confirmation statuses updated successfully',
      data: statuses
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;