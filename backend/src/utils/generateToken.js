import jwt from 'jsonwebtoken';

/**
 * Generate a JSON Web Token
 * @param {string} id - The MongoDB User ID to encode in the payload
 * @returns {string} - A signed JWT string
 */
const generateToken = (id) => {
  // Check if JWT_SECRET exists to prevent runtime errors
  if (!process.env.JWT_SECRET) {
    console.error('🛑 JWT_SECRET is not defined in environment variables.');
    throw new Error('Internal Server Configuration Error');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // 30 days is standard for mobile apps to reduce re-login friction
  });
};

export default generateToken;