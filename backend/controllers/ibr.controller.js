const IBRApplication = require('../models/IBRApplication');
const Project = require('../models/Project');
const User = require('../models/User');

exports.submitApplication = async (req, res) => {
  try {
    const { project_id, category, description, google_drive_link } = req.body;

    // Verify project is completed
    const project = await Project.findOne({
      where: { id: project_id, student_id: req.user.id, status: 'COMPLETED' }
    });

    if (!project) {
      return res.status(400).json({ message: 'Project must be completed to apply for IBR' });
    }

    // Check if already applied
    const existing = await IBRApplication.findOne({ where: { project_id } });
    if (existing) {
      return res.status(400).json({ message: 'Already applied for IBR with this project' });
    }

    const application = await IBRApplication.create({
      student_id: req.user.id,
      project_id,
      category,
      description,
      google_drive_link,
      status: 'SUBMITTED',
      progress_percentage: 10,
      required_documents: []
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Submit IBR application error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await IBRApplication.findAll({
      where: { student_id: req.user.id },
      include: [{
        model: Project,
        as: 'project',
        attributes: ['title', 'type']
      }],
      order: [['applied_date', 'DESC']]
    });

    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { google_drive_link } = req.body;

    const application = await IBRApplication.findOne({
      where: { id, student_id: req.user.id }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.google_drive_link = google_drive_link;
    if (application.status === 'DOCUMENTS_REQUIRED') {
      application.status = 'REVIEWING';
      application.progress_percentage = Math.min(application.progress_percentage + 20, 80);
    }
    await application.save();

    res.json(application);
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ message: 'Failed to upload documents' });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await IBRApplication.findAll({
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['full_name', 'email', 'school', 'country']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['title', 'type']
        }
      ],
      order: [['applied_date', 'DESC']]
    });

    res.json(applications);
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, required_documents } = req.body;

    const application = await IBRApplication.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update status
    if (status) {
      application.status = status;
    }

    // Update admin notes
    if (admin_notes !== undefined) {
      application.admin_notes = admin_notes;
    }

    // Update required documents (should be array)
    if (required_documents !== undefined) {
      // Convert string to array if needed
      if (typeof required_documents === 'string') {
        // Split by newlines and filter empty lines
        const docsArray = required_documents
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        application.required_documents = docsArray;
      } else if (Array.isArray(required_documents)) {
        application.required_documents = required_documents;
      } else {
        application.required_documents = [];
      }
    }

    // Update progress based on status
    const progressMap = {
      'SUBMITTED': 10,
      'REVIEWING': 30,
      'DOCUMENTS_REQUIRED': 40,
      'IN_PROGRESS': 60,
      'APPROVED': 100,
      'REJECTED': 0
    };
    
    if (status && progressMap[status] !== undefined) {
      application.progress_percentage = progressMap[status];
    }

    // Set approved date if status is APPROVED
    if (status === 'APPROVED' && !application.approved_date) {
      application.approved_date = new Date();
    }

    await application.save();
    
    // Fetch updated application with relations
    const updated = await IBRApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['full_name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['title', 'type']
        }
      ]
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress_percentage } = req.body;

    const application = await IBRApplication.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.progress_percentage = Math.min(Math.max(parseInt(progress_percentage, 10), 0), 100);
    await application.save();

    res.json(application);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
};