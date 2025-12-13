const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');
const Certificate = require('../models/Certificate');
const IBRApplication = require('../models/IBRApplication');
const { Op } = require('sequelize');

// Protect all admin routes
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: 'STUDENT' } });
    const activeStudents = await User.count({ where: { role: 'STUDENT', is_active: true } });
    const pendingProjects = await Project.count({ where: { status: 'PENDING_REVIEW' } });
    const completedProjects = await Project.count({ where: { status: 'COMPLETED' } });

    res.json({
      totalStudents,
      activeStudents,
      pendingProjects,
      completedProjects
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'STUDENT' },
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Toggle student active status
router.patch('/students/:id/toggle-active', async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.is_active = !student.is_active;
    await student.save();

    res.json({ message: 'Student status updated', student });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ message: 'Failed to update student status' });
  }
});

// Get all projects with optional limit
router.get('/projects', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    
    const projects = await Project.findAll({
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'full_name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit
    });

    const projectsWithNames = projects.map(p => ({
      ...p.toJSON(),
      student_name: p.student?.full_name || 'Unknown'
    }));

    res.json(projectsWithNames);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get specific project details
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'full_name', 'email', 'school']
        },
        {
          model: ProjectPlan,
          as: 'plan'
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

// Update project status
router.patch('/projects/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = status;
    await project.save();

    res.json({ message: 'Project status updated', project });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Create project plan
router.post('/projects/:id/plan', async (req, res) => {
  try {
    const { components, steps, safety_notes } = req.body;
    const projectId = req.params.id;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const existingPlan = await ProjectPlan.findOne({ where: { project_id: projectId } });
    
    if (existingPlan) {
      existingPlan.components = components;
      existingPlan.steps = steps;
      existingPlan.safety_notes = safety_notes;
      existingPlan.finalized_by_admin_id = req.user.id;
      await existingPlan.save();
      
      project.status = 'PLAN_READY';
      await project.save();
      
      return res.json({ message: 'Plan updated', plan: existingPlan });
    }

    const plan = await ProjectPlan.create({
      project_id: projectId,
      components,
      steps,
      safety_notes,
      finalized_by_admin_id: req.user.id
    });

    project.status = 'PLAN_READY';
    await project.save();

    res.status(201).json({ message: 'Plan created', plan });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Failed to create plan', error: error.message });
  }
});

// Get IBR applications
router.get('/ibr-applications', async (req, res) => {
  try {
    const applications = await IBRApplication.findAll({
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'full_name', 'email', 'school', 'country']
      }],
      order: [['created_at', 'DESC']]
    });

    const applicationsWithNames = applications.map(app => ({
      ...app.toJSON(),
      student_name: app.student?.full_name || 'Unknown',
      student_email: app.student?.email || '',
      student_school: app.student?.school || 'Unknown'
    }));

    res.json(applicationsWithNames);
  } catch (error) {
    console.error('Get IBR applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// Update IBR application status
router.patch('/ibr-applications/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await IBRApplication.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('Update IBR application error:', error);
    res.status(500).json({ message: 'Failed to update application', error: error.message });
  }
});

module.exports = router;