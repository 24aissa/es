const { OTP, User } = require('../models');
const jwt = require('jsonwebtoken');

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (using Twilio or mock in development)
const sendOTP = async (phone, code) => {
  if (process.env.NODE_ENV === 'development' || process.env.SKIP_SMS === 'true') {
    console.log(`📱 OTP for ${phone}: ${code}`);
    return true;
  }

  try {
    // TODO: Implement Twilio SMS sending
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your RoutePool verification code is: ${code}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });
    console.log(`📱 OTP sent to ${phone}: ${code}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

// Request OTP for phone number
const requestOTP = async (phone) => {
  try {
    // Clean phone number
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // Check for recent OTP requests (rate limiting)
    const recentOTP = await OTP.findOne({
      where: {
        phone: cleanPhone,
        createdAt: {
          [require('sequelize').Op.gt]: new Date(Date.now() - 60000) // 1 minute ago
        }
      }
    });

    if (recentOTP) {
      throw new Error('Please wait before requesting a new OTP');
    }

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    // Save OTP to database
    await OTP.create({
      phone: cleanPhone,
      code,
      expiresAt,
      verified: false,
      attempts: 0
    });

    // Send OTP via SMS
    await sendOTP(cleanPhone, code);

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    throw error;
  }
};

// Verify OTP and login/register user
const verifyOTP = async (phone, code) => {
  try {
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      where: {
        phone: cleanPhone,
        code: code,
        verified: false,
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      },
      order: [['created_at', 'DESC']]
    });

    if (!otpRecord) {
      // Increment attempts
      await OTP.update(
        { attempts: require('sequelize').literal('attempts + 1') },
        { where: { phone: cleanPhone, verified: false } }
      );
      throw new Error('Invalid or expired OTP');
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      throw new Error('Too many failed attempts. Please request a new OTP');
    }

    // Mark OTP as verified
    await otpRecord.update({ verified: true });

    // Find or create user
    let user = await User.findOne({ where: { phone: cleanPhone } });
    
    if (!user) {
      // Create new user
      user = await User.create({
        phone: cleanPhone,
        phoneVerified: true,
        name: `User ${cleanPhone.slice(-4)}`, // Temporary name
        role: 'passenger'
      });
    } else {
      // Update phone verification
      await user.update({ phoneVerified: true });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        rating: user.rating
      }
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  requestOTP,
  verifyOTP
};
