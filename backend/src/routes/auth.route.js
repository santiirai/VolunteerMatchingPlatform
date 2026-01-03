import express from 'express';
import { signup, login, getCurrentUser } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

console.log('[Auth Routes] Setting up auth routes');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

console.log('[Auth Routes] Auth routes configured');

export default router;


