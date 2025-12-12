const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const Award = require('../models/Award');

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
    
    if (stepIndex >= 0 && stepIndex < steps.length) {
      steps[stepIndex].status = status;
      plan.steps = steps;
      await plan.save();
      
      console.log('✅ Step status updated in database');

      // Check if all steps are done
      const allStepsDone = steps.every(step => step.status === 'done');
      console.log(`   Steps status: ${steps.filter(s => s.status === 'done').length}/${steps.length} done`);
      
      if (allStepsDone && project.status !== 'COMPLETED') {
        console.log('   🎉 All steps completed! Marking project as COMPLETED...');
        project.status = 'COMPLETED';
        await project.save();

        // Create achievement
        const projectCount = await Project.count({
          where: { student_id: req.user.id, status: 'COMPLETED' }
        });

        console.log(`   🏆 Total completed projects: ${projectCount}`);

        let achievementTitle = '🎉 First Project Completed!';
        let achievementIcon = '🎉';
        let achievementType = 'FIRST_PROJECT';

        if (projectCount === 5) {
          achievementTitle = '🎆 Five Projects Milestone!';
          achievementIcon = '🎆';
          achievementType = 'FIVE_PROJECTS';
        } else if (projectCount === 10) {
          achievementTitle = '🔥 Ten Projects Champion!';
          achievementIcon = '🔥';
          achievementType = 'TEN_PROJECTS';
        }

        // Check if achievement already exists
        const existingAward = await Award.findOne({
          where: {
            student_id: req.user.id,
            award_type: achievementType
          }
        });

        if (!existingAward) {
          await Award.create({
            student_id: req.user.id,
            title: achievementTitle,
            description: `Completed ${projectCount} STEM project(s)`,
            icon: achievementIcon,
            award_type: achievementType
          });
          console.log(`   ✅ Achievement created: ${achievementTitle}`);
        }

        // Create STEM certificate
        const existingCert = await Certificate.findOne({
          where: {
            student_id: req.user.id,
            project_id: project.id
          }
        });

        if (!existingCert) {
          const certNumber = `STEM-${Date.now()}-${req.user.id}`;
          const verifyCode = `VRF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

          await Certificate.create({
            student_id: req.user.id,
            project_id: project.id,
            certificate_type: 'STEM_ORG',
            certificate_number: certNumber,
            verification_code: verifyCode,
            issue_date: new Date()
          });
          console.log(`   🎓 Certificate created: ${certNumber}`);
        }

        console.log('   ✅ Project completion processing done!');
      }
    }

    // Reload fresh data to return
    await project.reload({ include: [{ model: ProjectPlan, as: 'plan' }] });
    
    console.log('✅ Returning updated project\n');
    res.json(project);
  } catch (error) {
    console.error('❌ Update step status error:', error);
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

    // Here you could store feature requests in a separate table
    // For now, just return success
    console.log(`Feature request for project ${id}:`, feature_description);
    
    res.json({ message: 'Feature request submitted successfully' });
  } catch (error) {
    console.error('Feature request error:', error);
    res.status(500).json({ message: 'Failed to submit feature request' });
  }
});

module.exports = router;