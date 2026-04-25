import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail } from '../services/emailService.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register new user & send verification email
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { 
      fullName, email, password, gender, age, 
      country, religion, profession, phone 
    } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Generate secure verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 3. Create user
    const user = await User.create({
      fullName,
      email,
      password, // Hashing is handled by User model middleware
      gender,
      age,
      country,
      religion,
      profession,
      phone,
      emailVerificationToken: verificationToken,
      isEmailVerified: false,
      isVerified: false 
    });

    if (user) {
      // 4. Send the verification email (Non-blocking)
      sendVerificationEmail(user.email, verificationToken).catch(err => 
        console.error(`Email delivery failed for ${user.email}:`, err)
      );

      // Return user data and JWT token using the utility
      res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });

    // 2. Check password and return data with token
    if (user && (await user.matchPassword(password))) {
      
      const verificationReminder = !user.isEmailVerified 
        ? "Please remember to verify your email address." 
        : null;

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id), 
        message: verificationReminder
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get user profile (Protected)
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};