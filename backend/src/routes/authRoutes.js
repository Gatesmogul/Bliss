const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Authentication Routes
 * Base Path: /api/auth
 */

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', registerUser);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
router.post('/login', loginUser);

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private (Requires JWT Token)
router.get('/profile', protect, getMe);

/**
 * Verification Routes (Extensions)
 * These connect to the email verification logic in your User model
 */

// @desc    Verify email token
// @route   GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({ 
      emailVerificationToken: req.params.token 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined; // Clear the token once used
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' });
  }
});

module.exports = router;