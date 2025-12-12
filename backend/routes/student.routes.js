const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const Award = require('../models/Award');
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
      status: 'PENDING_REVIEW'
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
    // Count total completed projects for this student
    const completedCount = await Project.count({
      where: {
        student_id: studentId,
        status: 'COMPLETED'
      }
    });

    console.log(`   Total completed projects: ${completedCount}`);

    // Create achievements based on milestones
    const achievements = [
      { count: 1, type: 'FIRST_PROJECT', title: '🎉 First Project Completed!', icon: '🎉', description: 'Successfully completed your first STEM project' },
      { count: 5, type: 'FIVE_PROJECTS', title: '🎆 Five Projects Milestone!', icon: '🎆', description: 'Completed 5 amazing STEM projects' },
      { count: 10, type: 'TEN_PROJECTS', title: '🔥 Ten Projects Champion!', icon: '🔥', description: 'Extraordinary achievement - 10 STEM projects completed!' }
    ];

    for (const achievement of achievements) {
      if (completedCount === achievement.count) {
        // Check if award already exists
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
        } else {
          console.log(`   ℹ️  Achievement already exists: ${achievement.title}`);
        }
      }
    }

    // Create certificate for this project
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
    } else {
      console.log(`   ℹ️  Certificate already exists for this project`);
    }

    console.log('✅ Project completion processing done!\n');
  } catch (error) {
    console.error('❌ Error processing project completion:', error);
  }
}

// Update step status - THE KEY FIX
router.patch('/projects/:id/steps/:stepIndex', async (req, res) => {
  try {
    const { id, stepIndex } = req.params;
    const { status } = req.body;

    console.log(`\n🔄 Updating step ${stepIndex} to status: ${status}`);
    console.log(`   Project ID: ${id}`);
    console.log(`   User: ${req.user.email}`);

    const project = await Project.findOne({
      where: { id, student_id: req.user.id },
      include: [{ model: ProjectPlan, as: 'plan' }]
    });

    if (!project || !project.plan) {
      console.error('❌ Project or plan not found');
      return res.status(404).json({ message: 'Project or plan not found' });
    }

    console.log(`   Current project status: ${project.status}`);

    // Update the step status
    const plan = project.plan;
    const steps = [...plan.steps];
    const index = parseInt(stepIndex);
    
    if (index >= 0 && index < steps.length) {
      const oldStatus = steps[index].status;
      steps[index].status = status;
      plan.steps = steps;
      
      // Mark plan as changed to force Sequelize to update JSONB field
      plan.changed('steps', true);
      await plan.save();
      
      console.log(`✅ Step ${index} updated: ${oldStatus || 'not_started'} → ${status}`);

      // Check if all steps are done
      const totalSteps = steps.length;
      const completedSteps = steps.filter(step => step.status === 'done').length;
      const allStepsDone = completedSteps === totalSteps;
      
      console.log(`   Progress: ${completedSteps}/${totalSteps} steps done (${Math.round((completedSteps/totalSteps)*100)}%)`);
      
      // If all steps are done AND project is not already completed, mark as completed
      if (allStepsDone && project.status !== 'COMPLETED') {
        console.log('   🎉 All steps completed! Marking project as COMPLETED...');
        
        project.status = 'COMPLETED';
        await project.save();
        
        console.log('   ✅ Project marked as COMPLETED');

        // Process achievements and certificates
        await processProjectCompletion(project.id, req.user.id);
      } else if (allStepsDone) {
        console.log('   ℹ️  All steps done but project already marked as COMPLETED');
      } else {
        // Update project status to IN_PROGRESS if at least one step is done
        if (completedSteps > 0 && project.status === 'PLAN_READY') {
          project.status = 'IN_PROGRESS';
          await project.save();
          console.log('   ✅ Project status updated to IN_PROGRESS');
        }
      }
    } else {
      console.error(`❌ Invalid step index: ${index}`);
      return res.status(400).json({ message: 'Invalid step index' });
    }

    // Reload fresh data to return
    await project.reload({ include: [{ model: ProjectPlan, as: 'plan' }] });
    
    console.log('✅ Returning updated project\n');
    res.json(project);
  } catch (error) {
    console.error('❌ Update step status error:', error);
    res.status(500).json({ message: 'Failed to update step status', error: error.message });
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