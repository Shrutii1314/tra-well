const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper to sign JWT token
const signToken = (id) => {
  const secret = process.env.JWT_SECRET || 'tra-well-super-secret-jwt-key-2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
  return jwt.sign({ id }, secret, { expiresIn });
};

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Handles traveler and agency initial registration
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, phone, avatar } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'An account with this email address already exists.'
      });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      avatar
    });

    // Generate JWT
    const token = signToken(newUser._id);

    // Hide password in response
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticates credentials and returns a signed JWT
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password presence
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide both email and password.'
      });
    }

    // Find user & include password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password.'
      });
    }

    // Generate JWT
    const token = signToken(user._id);

    // Hide password
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Protected route returning logged-in user profile
 * @access  Private (Authenticated Users)
 */
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
