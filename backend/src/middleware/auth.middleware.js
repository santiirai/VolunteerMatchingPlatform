import { verifyToken } from '../utils/jwt.util.js';

/**
 * Authentication middleware to protect routes
 */
export const authenticateToken = (req, res, next) => {
  console.log('[Auth Middleware] Checking authentication');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('[Auth Middleware] No token provided');
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    console.log('[Auth Middleware] User authenticated:', decoded.email);
    next();
  } catch (error) {
    console.error('[Auth Middleware] Authentication failed:', error.message);
    return res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token.' 
    });
  }
};


