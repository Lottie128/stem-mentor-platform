require('dotenv').config();
const { sequelize } = require('../config/database');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');
const Certificate = require('../models/Certificate');
const Award = require('../models/Award');
const User = require('../models/User');

const processCompletedProjects = async () => {
  try {
    console.log('\n🔍 Checking for completed projects without certificates...\n');

    // Find all projects with completed steps
    const projects = await Project.findAll({
      include: [{
        model: ProjectPlan,
        as: 'plan'
      }]
    });

    let processedCount = 0;

    for (const project of projects) {
      if (!project.plan || !project.plan.steps) continue;

      // Check if all steps are done
      const allStepsDone = project.plan.steps.every(step => step.status === 'done');

      if (allStepsDone) {
        // Update project status if not already completed
        if (project.status !== 'COMPLETED') {
          console.log(`📦 Updating project: ${project.title}`);
          project.status = 'COMPLETED';
          await project.save();
        }

        // Check if certificate already exists
        const existingCert = await Certificate.findOne({
          where: {
            student_id: project.student_id,
            project_id: project.id
          }
        });

        if (!existingCert) {
          console.log(`  ✅ Creating certificate for project #${project.id}`);
          
          const certNumber = `STEM-${Date.now()}-${project.student_id}`;
          const verifyCode = `VRF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

          await Certificate.create({
            student_id: project.student_id,
            project_id: project.id,
            certificate_type: 'STEM_ORG',
            certificate_number: certNumber,
            verification_code: verifyCode,
            issue_date: new Date()
          });

          processedCount++;
        }
      }
    }

    // Create achievement awards for each student
    console.log('\n🏆 Creating achievement awards...\n');

    const students = await User.findAll({
      where: { role: 'STUDENT' }
    });

    for (const student of students) {
      const completedCount = await Project.count({
        where: {
          student_id: student.id,
          status: 'COMPLETED'
        }
      });

      if (completedCount === 0) continue;

      // Check if first project award exists
      const hasFirstProject = await Award.findOne({
        where: {
          student_id: student.id,
          award_type: 'FIRST_PROJECT'
        }
      });

      if (!hasFirstProject) {
        console.log(`  🎉 Creating "First Project" award for ${student.full_name}`);
        await Award.create({
          student_id: student.id,
          title: '🎉 First Project Completed!',
          description: 'Successfully completed your first STEM project',
          icon: '🎉',
          award_type: 'FIRST_PROJECT'
        });
      }

      // Five projects milestone
      if (completedCount >= 5) {
        const hasFiveProjects = await Award.findOne({
          where: {
            student_id: student.id,
            award_type: 'FIVE_PROJECTS'
          }
        });

        if (!hasFiveProjects) {
          console.log(`  🎆 Creating "Five Projects" award for ${student.full_name}`);
          await Award.create({
            student_id: student.id,
            title: '🎆 Five Projects Milestone!',
            description: 'Completed 5 amazing STEM projects',
            icon: '🎆',
            award_type: 'FIVE_PROJECTS'
          });
        }
      }

      // Ten projects champion
      if (completedCount >= 10) {
        const hasTenProjects = await Award.findOne({
          where: {
            student_id: student.id,
            award_type: 'TEN_PROJECTS'
          }
        });

        if (!hasTenProjects) {
          console.log(`  🔥 Creating "Ten Projects" award for ${student.full_name}`);
          await Award.create({
            student_id: student.id,
            title: '🔥 Ten Projects Champion!',
            description: 'Extraordinary achievement - 10 STEM projects completed!',
            icon: '🔥',
            award_type: 'TEN_PROJECTS'
          });
        }
      }
    }

    console.log(`\n✨ Processing complete!`);
    console.log(`   Certificates created: ${processedCount}`);
    console.log(`\n✅ All past projects have been processed!\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error processing projects:', error);
    process.exit(1);
  }
};

// Run the script
processCompletedProjects();