const express = require('express');
const router = express.Router();
const submissionsController = require('../controllers/submissions.controller');
const { authenticate, requireRole, requireActive } = require('../middleware/auth.middleware');

// Student routes
router.post('/', authenticate, requireRole('STUDENT'), requireActive, submissionsController.submitStep);
router.get('/project/:projectId', authenticate, requireRole('STUDENT'), requireActive, submissionsController.getProjectSubmissions);

// Admin routes
router.get('/all', authenticate, requireRole('ADMIN'), submissionsController.getAllSubmissions);

module.exports = router;