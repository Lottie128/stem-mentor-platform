const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { User, Project, ProjectPlan, Certificate, IBRApplication } = require('../models');
const { generateProjectPlan } = require('../services/ai.service');
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

// Create new student
router.post('/students', async (req, res) => {
  try {
    const { full_name, email, age, school, country, expires_at } = req.body;

    // Validate required fields
    if (!full_name || !email || !expires_at) {
      return res.status(400).json({ message: 'Name, email, and expiry date are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Generate default password (first 8 chars of email)
    const defaultPassword = email.substring(0, 8);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create student
    const student = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
      role: 'STUDENT',
      is_active: true,
      age: age || null,
      school: school || null,
      country: country || null,
      expires_at: new Date(expires_at)
    });

    // Return student without password
    const { password_hash, ...studentData } = student.toJSON();
    
    res.status(201).json({
      message: 'Student created successfully',
      student: studentData,
      defaultPassword: defaultPassword
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Failed to create student', error: error.message });
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

// Update student expiry date
router.patch('/students/:id/expiry', async (req, res) => {
  try {
    const { expires_at } = req.body;
    const student = await User.findByPk(req.params.id);
    
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.expires_at = expires_at ? new Date(expires_at) : null;
    await student.save();

    res.json({ message: 'Expiry date updated', student });
  } catch (error) {
    console.error('Update expiry error:', error);
    res.status(500).json({ message: 'Failed to update expiry date' });
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

// Generate AI project plan
router.post('/projects/:id/generate-plan', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log(`\n🤖 Generating AI plan for project ${projectId}...`);
    
    // Generate plan using Gemini AI
    const generatedPlan = await generateProjectPlan(project);
    
    console.log('✅ AI plan generated successfully');
    
    res.json({
      message: 'Plan generated successfully',
      plan: generatedPlan
    });
  } catch (error) {
    console.error('❌ Generate plan error:', error);
    res.status(500).json({ 
      message: 'Failed to generate plan', 
      error: error.message 
    });
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

// Create or Update project plan (POST and PUT)
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

// Update project plan (PUT)
router.put('/projects/:id/plan', async (req, res) => {
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
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Failed to update plan', error: error.message });
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