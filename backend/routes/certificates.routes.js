const express = require('express');
const router = express.Router();
const certificatesController = require('../controllers/certificates.controller');
const { authenticate, requireRole, requireActive } = require('../middleware/auth.middleware');

// Student routes
router.get('/my-certificates', authenticate, requireRole('STUDENT'), requireActive, certificatesController.getMyCertificates);

// Admin routes
router.post('/generate', authenticate, requireRole('ADMIN'), certificatesController.generateCertificate);

// Public route
router.get('/verify/:code', certificatesController.verifyCertificate);

module.exports = router;