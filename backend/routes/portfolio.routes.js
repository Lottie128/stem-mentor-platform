const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');
const Certificate = require('../models/Certificate');

// Get public portfolio by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

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

    // Get only public projects
    const projects = await Project.findAll({
      where: { 
        student_id: user.id,
        is_public: true
      },
      include: [{
        model: ProjectPlan,
        as: 'plan'
      }],
      order: [['created_at', 'DESC']]
    });

    const certificates = await Certificate.findAll({
      where: { student_id: user.id },
      order: [['issue_date', 'DESC']]
    });

    const achievements = [];

    res.json({
      student: {
        full_name: user.full_name,
        email: user.email,
        age: user.age,
        school: user.school,
        country: user.country,
        bio: user.bio,
        profile_picture: user.profile_picture,
        skills: user.skills || [],
        social_links: user.social_links || {}
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

// Get public project blog view (will be implemented when submissions table exists)
router.get('/:username/project/:projectId', async (req, res) => {
  try {
    const { username, projectId } = req.params;

    // Find user
    const users = await User.findAll({
      where: { role: 'STUDENT', is_active: true }
    });

    const user = users.find(u => {
      const emailUsername = u.email.split('@')[0].toLowerCase();
      return emailUsername === username.toLowerCase();
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get project with plan
    const project = await Project.findOne({
      where: { 
        id: projectId,
        student_id: user.id,
        is_public: true
      },
      include: [{
        model: ProjectPlan,
        as: 'plan'
      }]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or not public' });
    }

    // Get submissions from database when table exists
    const submissions = [];

    res.json({
      student: {
        full_name: user.full_name,
        profile_picture: user.profile_picture
      },
      project,
      submissions
    });
  } catch (error) {
    console.error('Get project blog error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

module.exports = router;