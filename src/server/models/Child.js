const mongoose = require('mongoose');
const moment = require('moment');

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  birthDate: {
    type: Date,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Physical measurements for size recommendations
  measurements: {
    weight: Number, // in kg
    height: Number, // in cm
    lastUpdated: Date
  },
  // Size history for tracking growth
  sizeHistory: [{
    category: {
      type: String,
      enum: ['clothing', 'shoes', 'diapers']
    },
    size: String,
    ageInMonths: Number,
    dateRecorded: { type: Date, default: Date.now }
  }],
  // Preferences and notes
  preferences: {
    favoriteColors: [String],
    allergies: [String],
    notes: String
  },
  // Last size alert sent
  lastSizeAlert: {
    type: Date,
    default: null
  },
  // Current size recommendations
  currentSizes: {
    clothing: String,
    shoes: String,
    diapers: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
childSchema.index({ parent: 1 });
childSchema.index({ birthDate: 1 });

// Virtual for calculating age
childSchema.virtual('age').get(function() {
  return {
    years: moment().diff(moment(this.birthDate), 'years'),
    months: moment().diff(moment(this.birthDate), 'months'),
    days: moment().diff(moment(this.birthDate), 'days')
  };
});

// Virtual for age in months (useful for size calculations)
childSchema.virtual('ageInMonths').get(function() {
  return moment().diff(moment(this.birthDate), 'months');
});

// Method to check if size alert is due (every 6 months)
childSchema.methods.isSizeAlertDue = function() {
  if (!this.lastSizeAlert) return true;
  
  const monthsSinceLastAlert = moment().diff(moment(this.lastSizeAlert), 'months');
  return monthsSinceLastAlert >= 6;
};

// Method to get appropriate product categories for child's age
childSchema.methods.getAgeAppropriateCategories = function() {
  const ageInMonths = this.ageInMonths;
  
  const categories = {
    clothing: true,
    feeding: true,
    hygiene: true
  };
  
  // Age-specific categories
  if (ageInMonths >= 0) categories.diapers = true;
  if (ageInMonths >= 3) categories.toys_infant = true;
  if (ageInMonths >= 6) categories.solid_food = true;
  if (ageInMonths >= 12) {
    categories.toys_toddler = true;
    categories.shoes = true;
  }
  if (ageInMonths >= 24) {
    categories.furniture = true;
    categories.toys_preschool = true;
  }
  if (ageInMonths >= 36) {
    categories.educational_toys = true;
    categories.books = true;
  }
  
  return Object.keys(categories).filter(cat => categories[cat]);
};

// Method to get recommended clothing size based on age
childSchema.methods.getRecommendedClothingSize = function() {
  const ageInMonths = this.ageInMonths;
  
  // Size mapping based on typical growth charts
  if (ageInMonths <= 3) return 'Newborn-3M';
  if (ageInMonths <= 6) return '3-6M';
  if (ageInMonths <= 9) return '6-9M';
  if (ageInMonths <= 12) return '9-12M';
  if (ageInMonths <= 18) return '12-18M';
  if (ageInMonths <= 24) return '18-24M';
  if (ageInMonths <= 36) return '2T-3T';
  if (ageInMonths <= 48) return '3T-4T';
  if (ageInMonths <= 60) return '4T-5T';
  
  // For older children, use age in years
  const years = Math.floor(ageInMonths / 12);
  return `${years}Y`;
};

// Method to update size alert
childSchema.methods.updateSizeAlert = function() {
  this.lastSizeAlert = new Date();
  return this.save();
};

// Ensure virtual fields are serialized
childSchema.set('toJSON', { virtuals: true });
childSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Child', childSchema);