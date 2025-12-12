const express = require('express');
const router = express.Router();
const ibrController = require('../controllers/ibr.controller');
const { authenticate, requireRole, requireActive } = require('../middleware/auth.middleware');

// Student routes
router.post('/apply', authenticate, requireRole('STUDENT'), requireActive, ibrController.submitApplication);
router.get('/my-applications', authenticate, requireRole('STUDENT'), requireActive, ibrController.getMyApplications);
router.put('/applications/:id/documents', authenticate, requireRole('STUDENT'), requireActive, ibrController.uploadDocuments);

// Admin routes
router.get('/applications', authenticate, requireRole('ADMIN'), ibrController.getAllApplications);
router.put('/applications/:id/status', authenticate, requireRole('ADMIN'), ibrController.updateApplicationStatus);
router.put('/applications/:id/progress', authenticate, requireRole('ADMIN'), ibrController.updateProgress);

module.exports = router;