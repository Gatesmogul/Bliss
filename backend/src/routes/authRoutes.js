import express from 'express';
import { getMe, loginUser, registerUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js'; // Added missing import

const router = express.Router();

/**
 * Authentication Routes
 * Base Path: /api/auth
 */

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', registerUser);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
router.post('/login.js', loginUser); // Ensure consistency with .js extension if needed, though usually not for route paths

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private (Requires JWT Token)
router.get('/profile', protect, getMe);

/**
 * Verification Routes (Extensions)
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
    user.emailVerificationToken = undefined; 
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' });
  }
});

export default router;