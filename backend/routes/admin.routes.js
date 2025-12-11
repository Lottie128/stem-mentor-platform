const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// Protect all admin routes
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Dashboard stats
router.get('/stats', adminController.getStats);

// Student management
router.get('/students', adminController.getStudents);
router.post('/students', adminController.createStudent);
router.patch('/students/:id/status', adminController.toggleStudentStatus);

// Project management
router.get('/projects', adminController.getProjects);
router.get('/projects/:id', adminController.getProjectById);
router.post('/projects/:id/generate-plan', adminController.generatePlan);
router.put('/projects/:id/plan', adminController.updatePlan);

module.exports = router;