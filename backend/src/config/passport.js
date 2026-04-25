import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import User from '../models/User.js'; // Added .js extension for ESM

/**
 * Passport JWT Strategy Configuration
 * This middleware authenticates protected routes by verifying the JWT sent in headers.
 */

const options = {
  // Extract the token from the "Authorization" header as a Bearer token
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // The secret key used to sign the tokens (stored in .env)
  secretOrKey: process.env.JWT_SECRET,
};

const passportConfig = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        // Find the user specified in the token payload
        // We use .select('-password') to ensure the hashed password isn't attached to the request
        const user = await User.findById(jwt_payload.id).select('-password');

        if (user) {
          // If user exists, pass the user object to the next middleware
          return done(null, user);
        }

        // If user is not found
        return done(null, false);
      } catch (error) {
        console.error(`Passport Error: ${error.message}`);
        return done(error, false);
      }
    })
  );
};

export default passportConfig;