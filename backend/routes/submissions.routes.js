const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { sequelize } = require('../config/database');

// Get submissions for a project
router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Query submissions table directly
    const submissions = await sequelize.query(
      'SELECT * FROM step_submissions WHERE project_id = :projectId ORDER BY step_number ASC',
      {
        replacements: { projectId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
});

// Create submission
router.post('/', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const { project_id, step_number, video_link, images_link, notes } = req.body;

    // Insert into step_submissions table
    const result = await sequelize.query(
      `INSERT INTO step_submissions (project_id, step_number, video_link, images_link, notes, submitted_at, created_at, updated_at)
       VALUES (:project_id, :step_number, :video_link, :images_link, :notes, NOW(), NOW(), NOW())
       ON CONFLICT (project_id, step_number) 
       DO UPDATE SET video_link = :video_link, images_link = :images_link, notes = :notes, updated_at = NOW()
       RETURNING *`,
      {
        replacements: { project_id, step_number, video_link, images_link, notes },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({ message: 'Submission saved', submission: result[0][0] });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Failed to save submission' });
  }
});

module.exports = router;