import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @param {number} payload.id - User ID
 * @param {string} payload.email - User email
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  console.log('[JWT] Generating token for user:', payload.email);
  try {
    const token = jwt.sign(
      { id: payload.id, email: payload.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    console.log('[JWT] Token generated successfully');
    return token;
  } catch (error) {
    console.error('[JWT] Error generating token:', error);
    throw new Error('Failed to generate token');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  console.log('[JWT] Verifying token');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[JWT] Token verified successfully for user:', decoded.email);
    return decoded;
  } catch (error) {
    console.error('[JWT] Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
};


