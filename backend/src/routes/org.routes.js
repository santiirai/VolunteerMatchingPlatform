import express from 'express';
import { createOpportunity, getOrgOpportunities } from '../controllers/opportunity.controller.js';
import { getOrgApplications, updateApplicationStatus } from '../controllers/application.controller.js';
import { sendMessage, getConversations, getMessagesWithUser } from '../controllers/message.controller.js';
import { generateCertificate, getOrgCertificates, revokeCertificate } from '../controllers/certificate.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to ensure user is authenticated
router.use(authenticateToken);

// Opportunity Routes
router.post('/opportunities/create', createOpportunity);
router.get('/opportunities', getOrgOpportunities);

// Application Routes
router.get('/applications', getOrgApplications);
router.patch('/applications/:id/status', updateApplicationStatus);

// Message Routes
router.post('/messages/send', sendMessage);
router.get('/messages/conversations', getConversations);
router.get('/messages/:userId', getMessagesWithUser);

// Certificate Routes
router.post('/certificates/generate', generateCertificate);
router.get('/certificates', getOrgCertificates);
router.delete('/certificates/:id', revokeCertificate);

export default router;
