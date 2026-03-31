import { verifyToken } from '../utils/jwt.util.js';

/**
 * Authentication middleware to protect routes
 */
export const authenticateToken = (req, res, next) => {
  console.log('[Auth Middleware] Checking authentication');
  
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token && req.query.token) {
    token = req.query.token;
  }

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

/**
 * Optional authentication middleware - attaches user if token is valid,
 * but doesn't block the request if token is missing or invalid.
 */
export const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    // If token is provided but invalid, we just proceed without req.user
    console.log('[Auth Middleware] Optional token verification failed:', error.message);
    next();
  }
};


