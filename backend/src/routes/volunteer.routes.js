import express from 'express';
import { getAllOpportunities } from '../controllers/opportunity.controller.js';
import { applyToOpportunity, getVolunteerApplications } from '../controllers/application.controller.js';
import { getConversations, getMessagesWithUser, sendMessage } from '../controllers/message.controller.js';
import { getMyCertificates } from '../controllers/certificate.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to ensure user is authenticated
router.use(authenticateToken);

// Opportunity Routes
router.get('/opportunities/browse', getAllOpportunities);
router.post('/opportunities/:opportunityId/apply', applyToOpportunity);

// Application Routes
router.get('/applications/my', getVolunteerApplications);

// Message Routes
router.post('/messages/send', sendMessage);
router.get('/messages/conversations', getConversations);
router.get('/messages/:userId', getMessagesWithUser);

// Certificate Routes
router.get('/certificates/my', getMyCertificates);

export default router;
