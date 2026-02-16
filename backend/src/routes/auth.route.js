import express from 'express';
import { signup, login, getCurrentUser, forgotPassword, resetPassword, changePassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

console.log('[Auth Routes] Setting up auth routes');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/change-password', authenticateToken, changePassword);

console.log('[Auth Routes] Auth routes configured');

export default router;


