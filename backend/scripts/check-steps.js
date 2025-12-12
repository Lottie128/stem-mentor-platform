require('dotenv').config();
const { sequelize } = require('../config/database');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');

const checkSteps = async () => {
  try {
    console.log('\n🔍 Checking all projects and their step statuses...\n');

    const projects = await Project.findAll({
      include: [{
        model: ProjectPlan,
        as: 'plan'
      }],
      order: [['id', 'ASC']]
    });

    for (const project of projects) {
      console.log(`\n📦 Project #${project.id}: ${project.title}`);
      console.log(`   Status: ${project.status}`);
      
      if (project.plan && project.plan.steps) {
        const steps = project.plan.steps;
        const doneCount = steps.filter(s => s.status === 'done').length;
        const inProgressCount = steps.filter(s => s.status === 'in_progress').length;
        const notStartedCount = steps.filter(s => !s.status || s.status === 'not_started').length;
        
        console.log(`   Total steps: ${steps.length}`);
        console.log(`   ✅ Done: ${doneCount}`);
        console.log(`   🔵 In Progress: ${inProgressCount}`);
        console.log(`   ⚪ Not Started: ${notStartedCount}`);
        console.log(`   Progress: ${Math.round((doneCount / steps.length) * 100)}%`);
        
        // Show each step status
        console.log(`\n   Step breakdown:`);
        steps.forEach((step, index) => {
          const statusIcon = step.status === 'done' ? '✅' : step.status === 'in_progress' ? '🔵' : '⚪';
          console.log(`     ${statusIcon} Step ${step.step}: ${step.title} (${step.status || 'not_started'})`);
        });
      } else {
        console.log('   ❌ No plan found');
      }
    }

    console.log('\n✅ Check complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

checkSteps();