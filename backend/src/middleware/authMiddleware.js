import passport from 'passport';

/**
 * Protect Routes
 * This middleware uses the Passport JWT strategy to verify the token.
 * session: false is used because JWT is stateless.
 */
export const protect = passport.authenticate('jwt', { session: false });

/**
 * Verified User Middleware
 * Ensures the user has completed the verification process (e.g., selfie/ID).
 * This should be used AFTER the protect middleware.
 */
export const isVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    return next();
  }
  
  return res.status(403).json({ 
    message: 'Access denied. Please complete your profile verification to access this feature.' 
  });
};

/**
 * Admin Middleware (Optional)
 * Useful if you later add an admin panel to manage users.
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(401).json({ message: 'Not authorized as an admin' });
};