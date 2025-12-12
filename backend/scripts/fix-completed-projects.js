require('dotenv').config();
const { sequelize } = require('../config/database');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');
const Certificate = require('../models/Certificate');
const Award = require('../models/Award');
const crypto = require('crypto');

const fixCompletedProjects = async () => {
  try {
    console.log('\n🔧 Fixing completed projects and generating achievements...\n');

    // Get all projects with plans
    const projects = await Project.findAll({
      include: [{
        model: ProjectPlan,
        as: 'plan'
      }]
    });

    console.log(`Found ${projects.length} projects to check`);

    let fixedCount = 0;
    let certificatesCreated = 0;
    let awardsCreated = 0;

    for (const project of projects) {
      if (!project.plan || !project.plan.steps || project.plan.steps.length === 0) {
        continue;
      }

      // Check if all steps are done
      const allStepsDone = project.plan.steps.every(step => step.status === 'done');

      if (allStepsDone && project.status !== 'COMPLETED') {
        console.log(`\n📦 Fixing project: ${project.title}`);
        console.log(`   Current status: ${project.status}`);
        
        // Update project status
        project.status = 'COMPLETED';
        await project.save();
        fixedCount++;
        
        console.log(`   ✅ Updated to COMPLETED`);

        // Create certificate if it doesn't exist
        const existingCert = await Certificate.findOne({
          where: {
            student_id: project.student_id,
            project_id: project.id
          }
        });

        if (!existingCert) {
          const certNumber = `STEM-${Date.now()}-${project.student_id}`;
          const verifyCode = crypto.randomBytes(8).toString('hex').toUpperCase();

          await Certificate.create({
            student_id: project.student_id,
            project_id: project.id,
            certificate_type: 'STEM_ORG',
            certificate_number: certNumber,
            verification_code: verifyCode,
            issue_date: new Date()
          });
          certificatesCreated++;
          console.log(`   🎓 Created certificate: ${certNumber}`);
        }
      }
    }

    // Now create achievement awards for each student
    console.log('\n🏆 Creating achievement awards...\n');

    const completedProjects = await Project.findAll({
      where: { status: 'COMPLETED' },
      attributes: ['student_id'],
      group: ['student_id']
    });

    const studentIds = [...new Set(completedProjects.map(p => p.student_id))];

    for (const studentId of studentIds) {
      const completedCount = await Project.count({
        where: {
          student_id: studentId,
          status: 'COMPLETED'
        }
      });

      console.log(`\nStudent ID ${studentId}: ${completedCount} completed projects`);

      // Achievement definitions
      const achievements = [
        { count: 1, title: '🎉 First Project Completed!', icon: '🎉', description: 'Successfully completed your first STEM project' },
        { count: 5, title: '🎆 Five Projects Milestone!', icon: '🎆', description: 'Completed 5 amazing STEM projects' },
        { count: 10, title: '🔥 Ten Projects Champion!', icon: '🔥', description: 'Extraordinary achievement - 10 STEM projects completed!' }
      ];

      for (const achievement of achievements) {
        if (completedCount >= achievement.count) {
          const existingAward = await Award.findOne({
            where: {
              student_id: studentId,
              title: achievement.title
            }
          });

          if (!existingAward) {
            await Award.create({
              student_id: studentId,
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
              awarded_by: 1 // Default admin ID
            });
            awardsCreated++;
            console.log(`   ✅ Created award: ${achievement.title}`);
          }
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Projects fixed: ${fixedCount}`);
    console.log(`   Certificates created: ${certificatesCreated}`);
    console.log(`   Awards created: ${awardsCreated}`);
    console.log('\n✅ All done!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
fixCompletedProjects();