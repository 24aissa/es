const express = require('express');
const router = express.Router();

// @desc    Get delivery options
// @route   GET /api/delivery/options
// @access  Public
router.get('/options', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delivery options route - implementation coming soon',
    data: {
      providers: ['dzexpress', 'jetx', 'express_ems', 'yalidine'],
      provinces: ['Algiers', 'Oran', 'Constantine', 'Annaba'] // Add all Algerian provinces
    }
  });
});

module.exports = router;