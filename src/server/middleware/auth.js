const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: req.t ? req.t('error.noToken') : 'Not authorized, no token'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: req.t ? req.t('error.userNotFound') : 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: req.t ? req.t('error.accountDeactivated') : 'Account deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: req.t ? req.t('error.invalidToken') : 'Not authorized, invalid token'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: req.t ? req.t('error.notAuthenticated') : 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: req.t ? req.t('error.notAuthorized') : `Role ${req.user.role} is not authorized to access this resource`
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin/supervisor
const checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: req.t ? req.t('error.notAuthenticated') : 'Not authenticated'
      });
    }

    // Admin and supervisor can access all resources
    if (['admin', 'supervisor'].includes(req.user.role)) {
      return next();
    }

    // For regular users and workers, check ownership
    // This will be used in the route handler to verify ownership
    req.checkOwnership = {
      field: resourceField,
      userId: req.user._id
    };

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Invalid token, but continue without user
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Worker-specific middleware
const workerOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: req.t ? req.t('error.notAuthenticated') : 'Not authenticated'
      });
    }

    if (!['worker', 'supervisor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: req.t ? req.t('error.workerAccessOnly') : 'Worker access only'
      });
    }

    // Check if worker is active
    if (req.user.role === 'worker' && !req.user.workerInfo.isActive) {
      return res.status(403).json({
        success: false,
        message: req.t ? req.t('error.workerAccountInactive') : 'Worker account inactive'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  optionalAuth,
  workerOnly
};