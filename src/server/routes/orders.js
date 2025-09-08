const express = require('express');
const router = express.Router();

// @desc    Get all orders for user
// @route   GET /api/orders
// @access  Private
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Orders route - implementation coming soon',
    data: []
  });
});

module.exports = router;