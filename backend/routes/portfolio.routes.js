const express = require('express');
const router = express.Router();
const { User, Project, ProjectPlan, Certificate, Award } = require('../models');
const { authenticate } = require('../middleware/auth.middleware');

// Get public portfolio by username/email
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const student = await User.findOne({
      where: {
        email: username,
        role: 'STUDENT'
      },
      attributes: ['id', 'full_name', 'email', 'role', 'is_active', 'expires_at', 'age', 'school', 'country', 'profile_picture', 'bio', 'skills', 'social_links']
    });

    if (!student) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const [projects, certificates, awards] = await Promise.all([
      Project.findAll({
        where: { student_id: student.id, is_public: true },
        include: [{ model: ProjectPlan, as: 'plan' }],
        order: [['created_at', 'DESC']]
      }),
      Certificate.findAll({
        where: { student_id: student.id },
        include: [{ model: Project, as: 'project', attributes: ['id', 'title', 'type'] }],
        order: [['issue_date', 'DESC']]
      }),
      Award.findAll({
        where: { student_id: student.id },
        order: [['awarded_at', 'DESC']]
      })
    ]);

    res.json({
      student: student.toJSON(),
      projects,
      certificates,
      awards
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Get public project by username and project ID
router.get('/:username/projects/:projectId', async (req, res) => {
  try {
    const { username, projectId } = req.params;
    
    const student = await User.findOne({
      where: { email: username, role: 'STUDENT' },
      attributes: ['id', 'full_name', 'email', 'school', 'profile_picture']
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const project = await Project.findOne({
      where: {
        id: projectId,
        student_id: student.id,
        is_public: true
      },
      include: [{ model: ProjectPlan, as: 'plan' }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not public' });
    }

    res.json({ project, student });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update portfolio settings (authenticated)
router.put('/me/portfolio', authenticate, async (req, res) => {
  try {
    const { bio, skills, social_links, is_public, theme_color } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      bio: bio || user.bio,
      skills: skills || user.skills,
      social_links: social_links || user.social_links
    });

    res.json({ success: true, message: 'Portfolio updated' });
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

// Get own portfolio data (authenticated)
router.get('/me/portfolio', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'full_name', 'email', 'bio', 'skills', 'social_links', 'profile_picture']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get my portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

module.exports = router;