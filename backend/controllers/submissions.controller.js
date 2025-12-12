const StepSubmission = require('../models/StepSubmission');
const Project = require('../models/Project');

exports.submitStep = async (req, res) => {
  try {
    const { project_id, step_number, video_link, images_link, notes } = req.body;

    // Verify project belongs to student
    const project = await Project.findOne({
      where: { id: project_id, student_id: req.user.id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const submission = await StepSubmission.create({
      project_id,
      step_number,
      video_link,
      images_link,
      notes
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit step error:', error);
    res.status(500).json({ message: 'Failed to submit step' });
  }
};

exports.getProjectSubmissions = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project belongs to student
    const project = await Project.findOne({
      where: { id: projectId, student_id: req.user.id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const submissions = await StepSubmission.findAll({
      where: { project_id: projectId },
      order: [['step_number', 'ASC']]
    });

    res.json(submissions);
  } catch (error) {
    console.error('Get project submissions error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await StepSubmission.findAll({
      include: [{
        model: Project,
        as: 'project',
        attributes: ['title', 'student_id']
      }],
      order: [['submitted_at', 'DESC']]
    });

    res.json(submissions);
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};