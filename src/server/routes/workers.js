const express = require('express');
const router = express.Router();

// @desc    Get worker dashboard
// @route   GET /api/workers/dashboard
// @access  Private/Worker
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Worker dashboard route - implementation coming soon',
    data: {}
  });
});

module.exports = router;