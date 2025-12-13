const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Award = require('../models/Award');
const ProjectPlan = require('../models/ProjectPlan');

// Get public portfolio by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const student = await User.findOne({
      where: { email: username, role: 'STUDENT' },
      attributes: { exclude: ['password_hash'] }
    });

    if (!student) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const [projects, certificates, awards] = await Promise.all([
      Project.findAll({
        where: { student_id: student.id, is_public: true },
        include: [{ model: ProjectPlan, as: 'plan' }],
        order: [['created_at', 'DESC']]
      }),
      Certificate.findAll({
        where: { student_id: student.id },
        include: [{ model: Project, as: 'project' }],
        order: [['issue_date', 'DESC']]
      }),
      Award.findAll({
        where: { student_id: student.id },
        order: [['awarded_at', 'DESC']]
      })
    ]);

    res.json({
      student,
      projects,
      certificates,
      awards
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio', error: error.message });
  }
});

// Get specific public project
router.get('/:username/projects/:projectId', async (req, res) => {
  try {
    const { username, projectId } = req.params;

    const student = await User.findOne({
      where: { email: username, role: 'STUDENT' },
      attributes: { exclude: ['password_hash'] }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const project = await Project.findOne({
      where: { 
        id: projectId,
        student_id: student.id
      },
      include: [{ model: ProjectPlan, as: 'plan' }]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project, student });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
});

module.exports = router;