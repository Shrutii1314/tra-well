const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agency = require('../models/Agency');

/**
 * 1. Protect Middleware:
 * Extracts Bearer token from Authorization header, verifies JWT,
 * fetches matching user (excluding password), and attaches req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to gain access.'
      });
    }

    // Verify JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'tra-well-super-secret-jwt-key-2026';
    const decoded = jwt.verify(token, jwtSecret);

    // Fetch user matching token decoded ID (excluding password)
    const currentUser = await User.findById(decoded.id || decoded._id).select('-password');
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token. Please log in again.',
      error: error.message
    });
  }
};

/**
 * 2. restrictTo Middleware:
 * Checks if req.user.role matches allowed roles (e.g. restrictTo('admin', 'agency')).
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

/**
 * 3. requireApprovedAgency Middleware:
 * Checks if req.user.role === 'agency' AND verifies linked Agency profile
 * has verificationStatus === 'approved'.
 */
const requireApprovedAgency = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required.'
      });
    }

    if (req.user.role === 'agency') {
      const agency = await Agency.findOne({ user: req.user._id });

      if (!agency || agency.verificationStatus !== 'approved') {
        return res.status(403).json({
          status: 'fail',
          message: 'Agency pending approval. Your agency profile must be approved by an administrator before publishing tours or managing rosters.'
        });
      }

      req.agency = agency;
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to verify agency approval status.',
      error: error.message
    });
  }
};

module.exports = {
  protect,
  restrictTo,
  requireApprovedAgency
};
