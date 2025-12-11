const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, requireRole, requireActive } = require('../middleware/auth.middleware');

// Protect all student routes
router.use(authenticate);
router.use(requireRole('STUDENT'));
router.use(requireActive);

// Project operations
router.get('/projects', studentController.getMyProjects);
router.post('/projects', studentController.submitProject);
router.get('/projects/:id', studentController.getProjectById);
router.patch('/projects/:id/steps/:stepIndex', studentController.updateStepStatus);

module.exports = router;