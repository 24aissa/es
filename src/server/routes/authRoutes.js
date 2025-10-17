const express = require('express');
const router = express.Router();
const { requestOTP, verifyOTP } = require('../services/otpService');

// Request OTP
router.post('/otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const result = await requestOTP(phone);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP code are required'
      });
    }

    const result = await verifyOTP(phone, code);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'OTP verification failed'
    });
  }
});

module.exports = router;
