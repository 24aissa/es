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
  refundDate: Date
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

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);