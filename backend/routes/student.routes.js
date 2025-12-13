const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { Project, ProjectPlan, User, Certificate, Award } = require('../models');
const crypto = require('crypto');

// Protect all student routes
router.use(authenticate);
router.use(requireRole('STUDENT'));

// Get student's projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { student_id: req.user.id },
      include: [{
        model: ProjectPlan,
        as: 'plan'
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get specific project
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { 
        id: req.params.id,
        student_id: req.user.id 
      },
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
});

// Toggle project visibility
router.patch('/projects/:id/visibility', async (req, res) => {
  try {
    const { is_public } = req.body;
    
    const project = await Project.findOne({
      where: { id: req.params.id, student_id: req.user.id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.is_public = is_public;
    await project.save();

    res.json({ message: 'Project visibility updated', project });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({ message: 'Failed to update visibility' });
  }
});

// Create new project
router.post('/projects', async (req, res) => {
  try {
    const { title, type, purpose, experience_level, available_tools, budget_range, deadline } = req.body;

    const project = await Project.create({
      student_id: req.user.id,
      title,
      type,
      purpose,
      experience_level,
      available_tools,
      budget_range,
      deadline,
      status: 'PENDING_REVIEW',
      is_public: true
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Helper function to create achievements and certificates
async function processProjectCompletion(projectId, studentId) {
  console.log(`\n🎉 Processing project completion for project ${projectId}, student ${studentId}`);
  
  try {
    const completedCount = await Project.count({
      where: {
        student_id: studentId,
        status: 'COMPLETED'
      }
    });

    console.log(`   Total completed projects: ${completedCount}`);

    const achievements = [
      { count: 1, type: 'FIRST_PROJECT', title: '🎉 First Project Completed!', icon: '🎉', description: 'Successfully completed your first STEM project' },
      { count: 5, type: 'FIVE_PROJECTS', title: '🎆 Five Projects Milestone!', icon: '🎆', description: 'Completed 5 amazing STEM projects' },
      { count: 10, type: 'TEN_PROJECTS', title: '🔥 Ten Projects Champion!', icon: '🔥', description: 'Extraordinary achievement - 10 STEM projects completed!' }
    ];

    for (const achievement of achievements) {
      if (completedCount === achievement.count) {
        const existingAward = await Award.findOne({
          where: {
            student_id: studentId,
            award_type: achievement.type
          }
        });

        if (!existingAward) {
          await Award.create({
            student_id: studentId,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            award_type: achievement.type
          });
          console.log(`   ✅ Created achievement: ${achievement.title}`);
        }
      }
    }

    const existingCert = await Certificate.findOne({
      where: {
        student_id: studentId,
        project_id: projectId
      }
    });

    if (!existingCert) {
      const certNumber = `STEM-${Date.now()}-${studentId}`;
      const verifyCode = crypto.randomBytes(8).toString('hex').toUpperCase();

      await Certificate.create({
        student_id: studentId,
        project_id: projectId,
        certificate_type: 'STEM_ORG',
        certificate_number: certNumber,
        verification_code: verifyCode,
        issue_date: new Date()
      });
      console.log(`   🎓 Created certificate: ${certNumber}`);
    }

    console.log('✅ Project completion processing done!\n');
  } catch (error) {
    console.error('❌ Error processing project completion:', error);
  }
}

// Update step status
router.patch('/projects/:id/steps/:stepIndex', async (req, res) => {
  try {
    const { id, stepIndex } = req.params;
    const { status } = req.body;

    console.log(`\n🔄 Updating step ${stepIndex} to status: ${status}`);

    const project = await Project.findOne({
      where: { id, student_id: req.user.id },
      include: [{ model: ProjectPlan, as: 'plan' }]
    });

    if (!project || !project.plan) {
      return res.status(404).json({ message: 'Project or plan not found' });
    }

    const plan = project.plan;
    const steps = [...plan.steps];
    const index = parseInt(stepIndex);
    
    if (index >= 0 && index < steps.length) {
      steps[index].status = status;
      plan.steps = steps;
      plan.changed('steps', true);
      await plan.save();
      
      console.log(`✅ Step ${index} updated to ${status}`);

      const totalSteps = steps.length;
      const completedSteps = steps.filter(step => step.status === 'done').length;
      const allStepsDone = completedSteps === totalSteps;
      
      console.log(`   Progress: ${completedSteps}/${totalSteps} (${Math.round((completedSteps/totalSteps)*100)}%)`);
      
      if (allStepsDone && project.status !== 'COMPLETED') {
        project.status = 'COMPLETED';
        await project.save();
        await processProjectCompletion(project.id, req.user.id);
      } else if (completedSteps > 0 && project.status === 'PLAN_READY') {
        project.status = 'IN_PROGRESS';
        await project.save();
      }
    }

    await project.reload({ include: [{ model: ProjectPlan, as: 'plan' }] });
    res.json(project);
  } catch (error) {
    console.error('❌ Update step error:', error);
    res.status(500).json({ message: 'Failed to update step status' });
  }
});

// Feature request
router.post('/projects/:id/feature-request', async (req, res) => {
  try {
    const { id } = req.params;
    const { feature_description } = req.body;

    const project = await Project.findOne({
      where: { id, student_id: req.user.id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log(`Feature request for project ${id}:`, feature_description);
    res.json({ message: 'Feature request submitted successfully' });
  } catch (error) {
    console.error('Feature request error:', error);
    res.status(500).json({ message: 'Failed to submit feature request' });
  }
});

module.exports = router;