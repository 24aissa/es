const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    fr: { type: String, required: true },
    dz: { type: String, required: true }
  },
  description: {
    ar: { type: String, required: true },
    fr: { type: String, required: true },
    dz: { type: String, required: true }
  },
  category: {
    type: String,
    required: true,
    enum: [
      'clothing',
      'toys',
      'feeding',
      'hygiene',
      'furniture',
      'gifts',
      'offers',
      'seasonal'
    ]
  },
  subcategory: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: null // For sale items
  },
  currency: {
    type: String,
    default: 'DZD'
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  // Age range this product is suitable for
  ageRange: {
    minMonths: { type: Number, required: true },
    maxMonths: { type: Number, required: true }
  },
  // Size information for clothing
  sizes: [{
    size: String,
    stock: { type: Number, default: 0 },
    sku: String
  }],
  // General stock for non-sized items
  stock: {
    type: Number,
    default: 0
  },
  // Product specifications
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    material: String,
    color: [String],
    brand: String,
    model: String,
    safetyAge: String, // e.g., "3+" for toys
    gender: {
      type: String,
      enum: ['male', 'female', 'unisex'],
      default: 'unisex'
    }
  },
  // Seasonal information
  season: {
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter', 'all-season'],
    default: 'all-season'
  },
  // Rating and reviews
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false } // Verified purchase
  }],
  // SEO and tags
  tags: [String],
  seoSlug: {
    type: String,
    unique: true
  },
  // Status and visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  // Admin fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ 'ageRange.minMonths': 1, 'ageRange.maxMonths': 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ seoSlug: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ tags: 1 });

// Text indexes for search
productSchema.index({
  'name.ar': 'text',
  'name.fr': 'text',
  'name.dz': 'text',
  'description.ar': 'text',
  'description.fr': 'text',
  'description.dz': 'text',
  'tags': 'text'
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for availability
productSchema.virtual('isAvailable').get(function() {
  if (this.sizes && this.sizes.length > 0) {
    return this.sizes.some(size => size.stock > 0);
  }
  return this.stock > 0;
});

// Virtual for total stock
productSchema.virtual('totalStock').get(function() {
  if (this.sizes && this.sizes.length > 0) {
    return this.sizes.reduce((total, size) => total + size.stock, 0);
  }
  return this.stock;
});

// Method to check if product is suitable for child's age
productSchema.methods.isSuitableForAge = function(ageInMonths) {
  return ageInMonths >= this.ageRange.minMonths && ageInMonths <= this.ageRange.maxMonths;
};

// Method to get localized name
productSchema.methods.getLocalizedName = function(language = 'ar') {
  return this.name[language] || this.name.ar;
};

// Method to get localized description
productSchema.methods.getLocalizedDescription = function(language = 'ar') {
  return this.description[language] || this.description.ar;
};

// Method to update rating
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = { average: 0, count: 0 };
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = {
    average: totalRating / this.reviews.length,
    count: this.reviews.length
  };
};

// Generate SEO slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name.ar') || !this.seoSlug) {
    this.seoSlug = this.name.ar
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
    
    // Add random suffix to ensure uniqueness
    this.seoSlug += `-${Date.now()}`;
  }
  next();
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);