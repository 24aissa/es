const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    size: String, // For clothing items
    price: {
      type: Number,
      required: true
    },
    // Store product info at time of purchase
    productSnapshot: {
      name: String,
      image: String,
      sku: String
    }
  }],
  totals: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  currency: {
    type: String,
    default: 'DZD'
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    phone: String,
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: { type: String, default: 'DZ' },
    additionalInfo: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    phone: String,
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: { type: String, default: 'DZ' }
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['cod', 'card', 'bank_transfer', 'cib', 'stripe'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    cardLast4: String, // Only store last 4 digits
    paymentProvider: String
  },
  delivery: {
    provider: {
      type: String,
      enum: ['dzexpress', 'jetx', 'express_ems', 'yalidine', 'internal'],
      required: true
    },
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    deliveryFee: Number,
    deliveryNote: String
  },
  status: {
    type: String,
    enum: [
      'pending',      // Order placed but not confirmed
      'confirmed',    // Order confirmed, preparing
      'processing',   // Being prepared
      'ready',        // Ready for pickup/shipping
      'shipped',      // In transit
      'delivered',    // Successfully delivered
      'cancelled',    // Order cancelled
      'returned',     // Order returned
      'refunded'      // Order refunded
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Worker assignment
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workerNotes: String,
  // Customer feedback
  customerRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: Date
  },
  // Special instructions
  specialInstructions: String,
  giftMessage: String,
  isGift: { type: Boolean, default: false },
  // Promotional codes
  promoCode: String,
  promoDiscount: { type: Number, default: 0 },
  // Cancellation info
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  // Return info
  returnReason: String,
  returnRequestDate: Date,
  returnApprovedDate: Date,
  refundAmount: Number,
  refundDate: Date,
  // Customer Service - Order Confirmation System
  confirmation: {
    status: {
      type: String,
      enum: ['pending', 'attempting', 'confirmed', 'failed', 'abandoned'],
      default: 'pending'
    },
    attempts: [{
      attemptNumber: Number,
      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      method: {
        type: String,
        enum: ['phone', 'sms', 'email', 'whatsapp']
      },
      timestamp: { type: Date, default: Date.now },
      result: {
        type: String,
        enum: ['no_answer', 'confirmed', 'cancelled', 'reschedule', 'wrong_number', 'busy']
      },
      notes: String,
      nextAttemptAt: Date,
      duration: Number // in seconds
    }],
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    confirmedAt: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    customStatuses: [{
      name: String,
      color: String,
      description: String,
      isActive: { type: Boolean, default: true }
    }]
  },
  // Duplicate Detection
  duplicateInfo: {
    isDuplicate: { type: Boolean, default: false },
    originalOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    duplicateScore: Number, // 0-100 confidence score
    detectionMethod: String,
    detectedAt: Date,
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // SMS tracking
  smsHistory: [{
    type: {
      type: String,
      enum: ['confirmation', 'reminder', 'status_update', 'delivery_notification']
    },
    message: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'pending']
    },
    sentAt: Date,
    deliveredAt: Date,
    provider: String,
    cost: Number
  }]
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ assignedWorker: 1 });
orderSchema.index({ 'delivery.provider': 1 });
orderSchema.index({ 'delivery.trackingNumber': 1 });
orderSchema.index({ createdAt: -1 });
// Customer Service indexes
orderSchema.index({ 'confirmation.status': 1 });
orderSchema.index({ 'confirmation.assignedAgent': 1 });
orderSchema.index({ 'confirmation.priority': 1 });
orderSchema.index({ 'duplicateInfo.isDuplicate': 1 });
orderSchema.index({ 'shippingAddress.phone': 1 });
orderSchema.index({ user: 1, status: 1, createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count orders today to generate sequence
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const ordersToday = await this.constructor.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    const sequence = String(ordersToday + 1).padStart(4, '0');
    this.orderNumber = `BV${year}${month}${day}${sequence}`;
  }
  next();
});

// Add status to history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  next();
});

// Virtual for checking if order can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed', 'processing'].includes(this.status);
});

// Virtual for checking if order can be returned
orderSchema.virtual('canBeReturned').get(function() {
  if (this.status !== 'delivered') return false;
  
  // Allow returns within 7 days of delivery
  if (this.delivery.actualDelivery) {
    const deliveryDate = new Date(this.delivery.actualDelivery);
    const sevenDaysLater = new Date(deliveryDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    return new Date() <= sevenDaysLater;
  }
  
  return false;
});

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy
  });
  
  // Set special fields based on status
  if (newStatus === 'delivered' && !this.delivery.actualDelivery) {
    this.delivery.actualDelivery = new Date();
  }
  
  if (newStatus === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
    this.cancelledBy = updatedBy;
  }
  
  return this.save();
};

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.totals.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Apply discount
  const discountAmount = this.totals.subtotal * (this.promoDiscount / 100);
  this.totals.discount = discountAmount;
  
  // Calculate total
  this.totals.total = this.totals.subtotal - this.totals.discount + this.totals.shipping + this.totals.tax;
  
  return this.totals;
};

// Method to get current status info
orderSchema.methods.getCurrentStatusInfo = function() {
  const currentStatus = this.statusHistory[this.statusHistory.length - 1];
  return {
    status: this.status,
    timestamp: currentStatus ? currentStatus.timestamp : this.createdAt,
    note: currentStatus ? currentStatus.note : 'Order created'
  };
};

// Method to check for duplicates
orderSchema.methods.checkForDuplicates = async function() {
  const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
  const searchCriteria = {
    _id: { $ne: this._id },
    user: this.user,
    createdAt: {
      $gte: new Date(this.createdAt.getTime() - timeWindow),
      $lte: new Date(this.createdAt.getTime() + timeWindow)
    }
  };

  const potentialDuplicates = await this.constructor.find(searchCriteria);
  let maxScore = 0;
  let originalOrder = null;

  for (const order of potentialDuplicates) {
    let score = 0;
    
    // Same phone number
    if (this.shippingAddress.phone === order.shippingAddress.phone) score += 30;
    
    // Same address
    if (this.shippingAddress.street === order.shippingAddress.street &&
        this.shippingAddress.city === order.shippingAddress.city) score += 25;
    
    // Similar total amount (within 10%)
    const priceDiff = Math.abs(this.totals.total - order.totals.total) / this.totals.total;
    if (priceDiff < 0.1) score += 20;
    
    // Same item count
    if (this.items.length === order.items.length) score += 15;
    
    // Same products
    const thisProducts = this.items.map(item => item.product.toString()).sort();
    const orderProducts = order.items.map(item => item.product.toString()).sort();
    if (JSON.stringify(thisProducts) === JSON.stringify(orderProducts)) score += 30;

    if (score > maxScore) {
      maxScore = score;
      originalOrder = order._id;
    }
  }

  if (maxScore >= 70) { // 70% threshold for duplicate
    this.duplicateInfo = {
      isDuplicate: true,
      originalOrder,
      duplicateScore: maxScore,
      detectionMethod: 'automatic',
      detectedAt: new Date()
    };
  }

  return { isDuplicate: maxScore >= 70, score: maxScore, originalOrder };
};

// Method to assign to confirmation agent
orderSchema.methods.assignToAgent = function(agentId, priority = 'normal') {
  this.confirmation.assignedAgent = agentId;
  this.confirmation.assignedAt = new Date();
  this.confirmation.priority = priority;
  this.confirmation.status = 'attempting';
  return this.save();
};

// Method to add confirmation attempt
orderSchema.methods.addConfirmationAttempt = function(attemptData) {
  const attemptNumber = this.confirmation.attempts.length + 1;
  this.confirmation.attempts.push({
    attemptNumber,
    ...attemptData,
    timestamp: new Date()
  });
  
  if (attemptData.result === 'confirmed') {
    this.confirmation.status = 'confirmed';
    this.confirmation.confirmedAt = new Date();
    this.status = 'confirmed';
  } else if (attemptData.result === 'cancelled') {
    this.confirmation.status = 'failed';
    this.status = 'cancelled';
    this.cancelledAt = new Date();
  }
  
  return this.save();
};

// Method to send SMS
orderSchema.methods.sendSMS = function(type, message, provider = 'default') {
  this.smsHistory.push({
    type,
    message,
    status: 'sent',
    sentAt: new Date(),
    provider
  });
  return this.save();
};

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);