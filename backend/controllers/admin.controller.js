const User = require('../models/User');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');
const { Op } = require('sequelize');
const { generateProjectPlan } = require('../services/ai.service');

exports.getStats = async (req, res) => {
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
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'STUDENT' },
      order: [['created_at', 'DESC']]
    });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { full_name, email, password, expires_at } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password required' });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const student = await User.create({
      full_name,
      email,
      password_hash: password,
      role: 'STUDENT',
      is_active: true,
      expires_at: expires_at || null
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Failed to create student' });
  }
};

exports.toggleStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const student = await User.findOne({ where: { id, role: 'STUDENT' } });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.is_active = is_active;
    await student.save();

    res.json(student);
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Failed to update student status' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const projects = await Project.findAll({
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'full_name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    const formattedProjects = projects.map(p => ({
      ...p.toJSON(),
      student_name: p.student?.full_name || 'Unknown'
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'full_name', 'email']
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

    const formatted = {
      ...project.toJSON(),
      student_name: project.student?.full_name || 'Unknown'
    };

    res.json(formatted);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

exports.generatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('\n=== AI PLAN GENERATION REQUEST ===');
    console.log('Project ID:', id);
    console.log('Request from:', req.user?.email);
    console.log('Timestamp:', new Date().toISOString());

    const project = await Project.findByPk(id);

    if (!project) {
      console.error('❌ Project not found:', id);
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('✅ Project found:', project.title);
    console.log('Calling AI service...');

    // Generate plan using AI service
    const planData = await generateProjectPlan(project);

    console.log('✅ Plan generated, saving to database...');

    // Create or update plan
    let plan = await ProjectPlan.findOne({ where: { project_id: id } });

    if (plan) {
      console.log('Updating existing plan...');
      plan.components = planData.components;
      plan.steps = planData.steps;
      plan.safety_notes = planData.safety_notes;
      plan.generated_by_ai = true;
      await plan.save();
    } else {
      console.log('Creating new plan...');
      plan = await ProjectPlan.create({
        project_id: id,
        components: planData.components,
        steps: planData.steps,
        safety_notes: planData.safety_notes,
        generated_by_ai: true
      });
    }

    console.log('✅ Plan saved successfully!');
    console.log('=== GENERATION COMPLETE ===\n');

    res.json({ plan });
  } catch (error) {
    console.error('\n❌ GENERATE PLAN ERROR:', error.message);
    console.error('Stack:', error.stack);
    console.error('=== GENERATION FAILED ===\n');
    res.status(500).json({ message: error.message || 'Failed to generate plan' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, status } = req.body;

    console.log('\nUpdating plan for project:', id);

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let projectPlan = await ProjectPlan.findOne({ where: { project_id: id } });

    if (projectPlan) {
      projectPlan.components = plan.components;
      projectPlan.steps = plan.steps;
      projectPlan.safety_notes = plan.safety_notes;
      projectPlan.finalized_by_admin_id = req.user.id;
      await projectPlan.save();
      console.log('✅ Plan updated');
    } else {
      projectPlan = await ProjectPlan.create({
        project_id: id,
        components: plan.components,
        steps: plan.steps,
        safety_notes: plan.safety_notes,
        finalized_by_admin_id: req.user.id
      });
      console.log('✅ Plan created');
    }

    if (status) {
      project.status = status;
      await project.save();
      console.log('✅ Project status updated to:', status);
    }

    res.json({ project, plan: projectPlan });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Failed to update plan' });
  }
};