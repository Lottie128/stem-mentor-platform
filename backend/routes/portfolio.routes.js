const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');

// Get public portfolio by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by email username (before @)
    const users = await User.findAll({
      where: { role: 'STUDENT', is_active: true }
    });

    const user = users.find(u => {
      const emailUsername = u.email.split('@')[0].toLowerCase();
      return emailUsername === username.toLowerCase();
    });

    if (!user) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Get user's projects
    const projects = await Project.findAll({
      where: { student_id: user.id },
      order: [['created_at', 'DESC']]
    });

    // Get certificates
    const certificates = await Certificate.findAll({
      where: { student_id: user.id },
      order: [['issue_date', 'DESC']]
    });

    // Get achievements
    const achievements = await Achievement.findAll({
      where: { student_id: user.id },
      order: [['date_earned', 'DESC']]
    });

    res.json({
      student: {
        full_name: user.full_name,
        email: user.email,
        age: user.age,
        school: user.school,
        country: user.country,
        bio: user.bio,
        profile_picture: user.profile_picture
      },
      projects,
      certificates,
      achievements
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

module.exports = router;