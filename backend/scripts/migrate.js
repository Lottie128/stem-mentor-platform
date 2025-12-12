require('dotenv').config();
const { sequelize } = require('../config/database');

// Import ALL models to register them
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');
const Award = require('../models/Award');
const Portfolio = require('../models/Portfolio');
const StepSubmission = require('../models/StepSubmission');
const IBRApplication = require('../models/IBRApplication');
const Certificate = require('../models/Certificate');

const bcrypt = require('bcrypt');

const migrate = async () => {
  try {
    console.log('Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models (creates tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    console.log('   - users');
    console.log('   - projects');
    console.log('   - project_plans');
    console.log('   - awards');
    console.log('   - portfolios');
    console.log('   - step_submissions');
    console.log('   - ibr_applications');
    console.log('   - certificates');
    
    // Check if admin exists
    const adminExists = await User.findOne({ where: { email: 'admin@stemmentor.com' } });
    
    if (!adminExists) {
      // Create default admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@stemmentor.com',
        password: hashedPassword,
        full_name: 'Admin User',
        role: 'ADMIN',
        is_active: true
      });
      console.log('✅ Default admin account created');
      console.log('   Email: admin@stemmentor.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin account already exists');
    }
    
    // Check if demo student exists
    const studentExists = await User.findOne({ where: { email: 'student@example.com' } });
    
    if (!studentExists) {
      // Create demo student
      const hashedPassword = await bcrypt.hash('student123', 10);
      await User.create({
        email: 'student@example.com',
        password: hashedPassword,
        full_name: 'Demo Student',
        role: 'STUDENT',
        is_active: true
      });
      console.log('✅ Demo student account created');
      console.log('   Email: student@example.com');
      console.log('   Password: student123');
    } else {
      console.log('ℹ️  Demo student account already exists');
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n🚀 You can now start the server with: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();