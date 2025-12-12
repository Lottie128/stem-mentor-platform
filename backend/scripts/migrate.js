require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectPlan = require('../models/ProjectPlan');

const migrate = async () => {
  try {
    console.log('Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synchronized');

    // Create default admin if doesn't exist
    const adminExists = await User.findOne({ where: { email: 'admin@stemmentor.com' } });
    
    if (!adminExists) {
      await User.create({
        full_name: 'Admin User',
        email: 'admin@stemmentor.com',
        password_hash: 'admin123',
        role: 'ADMIN',
        is_active: true
      });
      console.log('✅ Default admin account created (email: admin@stemmentor.com, password: admin123)');
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    // Create demo student if doesn't exist
    const studentExists = await User.findOne({ where: { email: 'student@example.com' } });
    
    if (!studentExists) {
      await User.create({
        full_name: 'Demo Student',
        email: 'student@example.com',
        password_hash: 'student123',
        role: 'STUDENT',
        is_active: true,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      });
      console.log('✅ Demo student account created (email: student@example.com, password: student123)');
    } else {
      console.log('ℹ️  Demo student account already exists');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nDefault Accounts:');
    console.log('Admin: admin@stemmentor.com / admin123');
    console.log('Student: student@example.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();