const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolio.controller');
const { authenticate, requireRole, requireActive } = require('../middleware/auth.middleware');

// Public routes (no auth)
router.get('/:slug', portfolioController.getPublicPortfolio);

// Student routes (authenticated)
router.get('/me/portfolio', authenticate, requireRole('STUDENT'), requireActive, portfolioController.getMyPortfolio);
router.put('/me/portfolio', authenticate, requireRole('STUDENT'), requireActive, portfolioController.updatePortfolio);

module.exports = router;