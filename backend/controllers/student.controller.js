const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { student_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json(projects);
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

exports.submitProject = async (req, res) => {
  try {
    const { title, type, purpose, experience_level, available_tools, budget_range, deadline } = req.body;

    if (!title || !type || !purpose || !experience_level || !budget_range) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const project = await Project.create({
      student_id: req.user.id,
      title,
      type,
      purpose,
      experience_level,
      available_tools,
      budget_range,
      deadline: deadline || null,
      status: 'PENDING_REVIEW'
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Submit project error:', error);
    res.status(500).json({ message: 'Failed to submit project' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      where: { id, student_id: req.user.id },
      include: [{
        model: ProjectPlan,
        as: 'plan'
      }]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

exports.updateStepStatus = async (req, res) => {
  try {
    const { id, stepIndex } = req.params;
    const { status } = req.body;

    const project = await Project.findOne({
      where: { id, student_id: req.user.id },
      include: [{ model: ProjectPlan, as: 'plan' }]
    });

    if (!project || !project.plan) {
      return res.status(404).json({ message: 'Project or plan not found' });
    }

    const steps = project.plan.steps;
    const index = parseInt(stepIndex);

    if (index < 0 || index >= steps.length) {
      return res.status(400).json({ message: 'Invalid step index' });
    }

    steps[index].status = status;
    project.plan.steps = steps;
    await project.plan.save();

    res.json({ plan: project.plan });
  } catch (error) {
    console.error('Update step error:', error);
    res.status(500).json({ message: 'Failed to update step' });
  }
};