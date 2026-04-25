const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, isVerified } = require('../middleware/authMiddleware');

/**
 * User Management Routes
 * Base Path: /api/users
 */

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update fields if they are provided in the request body
      user.fullName = req.body.fullName || user.fullName;
      user.about = req.body.about || user.about;
      user.profession = req.body.profession || user.profession;
      user.religion = req.body.religion || user.religion;
      user.profileImage = req.body.profileImage || user.profileImage;
      
      // Update preferences/demographics if needed
      if (req.body.age) user.age = req.body.age;
      if (req.body.country) user.country = req.body.country;

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        about: updatedUser.about,
        isVerified: updatedUser.isVerified,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// @desc    Get a specific user's public profile (for Discovery/Matching)
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // We only select public-facing fields to protect privacy
    const user = await User.findById(req.params.id).select(
      'fullName age country profession religion about profileImage isVerified createdAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete user account (GDPR Compliance)
// @route   DELETE /api/users/profile
// @access  Private
router.delete('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // In a real production app, you might "soft delete" or 
      // archive data instead of hard deleting immediately.
      await User.deleteOne({ _id: req.user._id });
      res.status(200).json({ message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account' });
  }
});

module.exports = router;