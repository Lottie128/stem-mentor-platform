const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { Award } = require('../models');

// Get my awards (student)
router.get('/me', authenticate, async (req, res) => {
  try {
    const awards = await Award.findAll({
      where: { student_id: req.user.id },
      order: [['awarded_at', 'DESC']]
    });

    res.json(awards);
  } catch (error) {
    console.error('Get my awards error:', error);
    res.status(500).json({ message: 'Failed to fetch awards' });
  }
});

module.exports = router;