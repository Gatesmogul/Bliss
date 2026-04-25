const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Bliss User Model
 * Manages identity, authentication, verification, and social connections.
 */
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    
    // --- Demographics & Profile ---
    gender: { type: String, enum: ['male', 'female', 'non-binary'] },
    age: { type: Number },
    country: { type: String },
    profession: { type: String },
    religion: { type: String },
    about: { type: String, maxLength: 500 },
    profileImage: { type: String },
    
    // --- Interests & Compatibility ---
    // Added for the matching algorithm compatibility scoring
    interestTags: [{ type: String }], 

    // --- Verification System ---
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    isVerified: { type: Boolean, default: false }, // General profile verification (ID/Selfie)

    // --- Connections & Social Graph ---
    connectionRequests: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { 
          type: String, 
          enum: ['pending', 'accepted', 'rejected'], 
          default: 'pending' 
        },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // --- Settings & Role ---
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    lastLogin: { type: Date },
  },
  {
    timestamps: true, // Captures 'createdAt' and 'updatedAt'
  }
);

/**
 * Password Hashing Middleware
 * Automatically hashes the password before saving if it has been modified.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Instance Method: Compare Password
 * Used during the login process to verify the user.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Indexing for search performance
 * Added interestTags to indexing for faster filtering during discovery
 */
userSchema.index({ email: 1 });
userSchema.index({ country: 1, gender: 1 });
userSchema.index({ interestTags: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;