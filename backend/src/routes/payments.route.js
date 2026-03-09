import express from 'express';
import rateLimit from 'express-rate-limit';
import { initiatePayment, verifyPayment, paymentCallback, getMyDonations, getReceivedDonations } from '../controllers/payments.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

router.use(limiter);

router.post('/initiate', initiatePayment);
router.post('/verify', verifyPayment);
router.post('/callback', paymentCallback);

// Donation history
router.get('/my', authenticateToken, getMyDonations);
router.get('/received', authenticateToken, getReceivedDonations);

export default router;

