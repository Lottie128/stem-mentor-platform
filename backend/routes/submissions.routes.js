const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const Submission = require('../models/Submission');

// Get submissions for a project
router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const submissions = await Submission.findAll({
      where: { project_id: projectId },
      order: [['step_number', 'ASC']]
    });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
});

// Create or update submission
router.post('/', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const { project_id, step_number, video_link, images_link, notes } = req.body;

    // Check if submission exists
    const existing = await Submission.findOne({
      where: { 
        project_id,
        step_number 
      }
    });

    let submission;
    if (existing) {
      // Update existing
      await existing.update({
        video_link,
        images_link,
        notes,
        submitted_at: new Date()
      });
      submission = existing;
    } else {
      // Create new
      submission = await Submission.create({
        project_id,
        student_id: req.user.id,
        step_number,
        video_link,
        images_link,
        notes,
        submitted_at: new Date()
      });
    }

    res.status(201).json({ message: 'Submission saved', submission });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Failed to save submission', error: error.message });
  }
});

module.exports = router;