const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'worker', 'supervisor', 'admin'],
    default: 'user'
  },
  preferredLanguage: {
    type: String,
    enum: ['ar', 'fr', 'dz'],
    default: 'ar'
  },
  addresses: [{
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: { type: String, default: 'DZ' },
    isDefault: { type: Boolean, default: false }
  }],
  notificationSettings: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sizeAlerts: { type: Boolean, default: true },
    productRecommendations: { type: Boolean, default: true }
  },
  // OAuth providers
  googleId: String,
  appleId: String,
  // Worker-specific fields
  workerInfo: {
    employeeId: String,
    workZone: String, // Province or area they cover
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 }
  },
  // Customer Service - Customer classification
  customerClassification: {
    type: {
      type: String,
      enum: ['new', 'regular', 'loyal', 'vip', 'bad'],
      default: 'new'
    },
    score: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    returnedOrders: { type: Number, default: 0 },
    lastOrderDate: Date,
    flags: [{
      type: String,
      reason: String,
      date: { type: Date, default: Date.now },
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    notes: [{
      content: String,
      date: { type: Date, default: Date.now },
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  // Confirmation Agent specific fields
  agentInfo: {
    isConfirmationAgent: { type: Boolean, default: false },
    preferences: {
      maxOrdersPerDay: { type: Number, default: 50 },
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' }
      },
      preferredLanguages: [{ type: String, enum: ['ar', 'fr', 'dz'] }],
      provinces: [String], // Preferred provinces
      categories: [String] // Preferred product categories
    },
    performance: {
      totalConfirmations: { type: Number, default: 0 },
      successfulConfirmations: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 }, // in minutes
      rating: { type: Number, default: 0 }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Get default address
userSchema.virtual('defaultAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

// Hide sensitive fields
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Method to update customer classification
userSchema.methods.updateCustomerClassification = async function() {
  const Order = require('./Order');
  
  // Get user's order statistics
  const orderStats = await Order.aggregate([
    { $match: { user: this._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totals.total' },
        cancelledOrders: { 
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        returnedOrders: { 
          $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
        },
        lastOrderDate: { $max: '$createdAt' }
      }
    }
  ]);

  const stats = orderStats[0] || {
    totalOrders: 0,
    totalSpent: 0,
    cancelledOrders: 0,
    returnedOrders: 0,
    lastOrderDate: null
  };

  // Calculate classification score
  let score = 0;
  
  // Positive factors
  score += stats.totalOrders * 5; // 5 points per order
  score += Math.floor(stats.totalSpent / 1000) * 2; // 2 points per 1000 DZD spent
  
  // Negative factors
  const cancellationRate = stats.totalOrders > 0 ? stats.cancelledOrders / stats.totalOrders : 0;
  const returnRate = stats.totalOrders > 0 ? stats.returnedOrders / stats.totalOrders : 0;
  
  score -= cancellationRate * 50; // Penalize high cancellation rate
  score -= returnRate * 30; // Penalize high return rate
  
  // Determine classification
  let classification = 'new';
  if (stats.totalOrders === 0) {
    classification = 'new';
  } else if (score < -20 || cancellationRate > 0.5 || returnRate > 0.3) {
    classification = 'bad';
  } else if (score >= 100 && stats.totalSpent >= 50000) {
    classification = 'vip';
  } else if (score >= 50 && stats.totalOrders >= 5) {
    classification = 'loyal';
  } else if (stats.totalOrders >= 2) {
    classification = 'regular';
  }

  // Update customer classification
  this.customerClassification.type = classification;
  this.customerClassification.score = Math.round(score);
  this.customerClassification.totalOrders = stats.totalOrders;
  this.customerClassification.totalSpent = stats.totalSpent;
  this.customerClassification.cancelledOrders = stats.cancelledOrders;
  this.customerClassification.returnedOrders = stats.returnedOrders;
  this.customerClassification.lastOrderDate = stats.lastOrderDate;

  return this.save();
};

// Method to add customer flag
userSchema.methods.addCustomerFlag = function(type, reason, addedBy) {
  this.customerClassification.flags.push({
    type,
    reason,
    date: new Date(),
    addedBy
  });
  return this.save();
};

// Method to add customer note
userSchema.methods.addCustomerNote = function(content, addedBy) {
  this.customerClassification.notes.push({
    content,
    date: new Date(),
    addedBy
  });
  return this.save();
};

module.exports = mongoose.model('User', userSchema);