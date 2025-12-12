const express = require('express');
const router = express.Router();
const awardsController = require('../controllers/awards.controller');
const { authenticate, requireRole, requireActive } = require('../middleware/auth.middleware');

// Admin routes
router.post('/', authenticate, requireRole('ADMIN'), awardsController.createAward);
router.delete('/:id', authenticate, requireRole('ADMIN'), awardsController.deleteAward);

// Student routes
router.get('/me', authenticate, requireRole('STUDENT'), requireActive, awardsController.getMyAwards);

module.exports = router;