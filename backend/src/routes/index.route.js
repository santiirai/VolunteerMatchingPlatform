import express from 'express';
import authRoutes from './auth.route.js';
import orgRoutes from './org.routes.js';
import volunteerRoutes from './volunteer.routes.js';
import profileRoutes from './profile.route.js';

const router = express.Router();

console.log('[Routes] Setting up main routes');

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('[Routes] Health check requested');
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/', orgRoutes); // Mount directly for simplicity as per frontend paths (/api/opportunities/create etc.)
router.use('/volunteer', volunteerRoutes); // Volunteer-specific routes
router.use('/profile', profileRoutes);

console.log('[Routes] Main routes configured');

export default router;


