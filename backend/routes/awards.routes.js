const express = require('express');
const router = express.Router();
const Award = require('../models/Award');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// Get student's awards
router.get('/me', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const awards = await Award.findAll({
      where: { student_id: req.user.id },
      order: [['awarded_at', 'DESC']]
    });

    res.json(awards);
  } catch (error) {
    console.error('Get awards error:', error);
    res.status(500).json({ message: 'Failed to fetch awards', error: error.message });
  }
});

// Admin: Create award for student
router.post('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { student_id, title, description, icon, award_type } = req.body;

    const award = await Award.create({
      student_id,
      title,
      description,
      icon: icon || '🏆',
      award_type,
      awarded_by: req.user.id
    });

    res.status(201).json(award);
  } catch (error) {
    console.error('Create award error:', error);
    res.status(500).json({ message: 'Failed to create award', error: error.message });
  }
});

module.exports = router;