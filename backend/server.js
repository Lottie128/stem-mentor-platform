require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');

// Import all models first to register them
require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const studentRoutes = require('./routes/student.routes');
const awardsRoutes = require('./routes/awards.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const ibrRoutes = require('./routes/ibr.routes');
const submissionsRoutes = require('./routes/submissions.routes');
const certificatesRoutes = require('./routes/certificates.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'STEM Mentor API is running', 
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: ['IBR Applications', 'Step Submissions', 'STEM Certificates', 'Awards', 'Portfolios']
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/awards', awardsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ibr', ibrRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/certificates', certificatesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    console.log(`   Database: ${sequelize.config.database}`);
    console.log(`   Host: ${sequelize.config.host}`);
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 Server started successfully!');
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Port: ${PORT}`);
      console.log(`   API: http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log('\n✨ Available Features:');
      console.log('   • Student Management');
      console.log('   • Project Planning with AI');
      console.log('   • Step-by-step Submissions');
      console.log('   • IBR Applications');
      console.log('   • STEM Certificates');
      console.log('   • Awards & Achievements');
      console.log('   • Public Portfolios');
      console.log('\n📚 Ready to accept requests!\n');
    });
  } catch (error) {
    console.error('\n❌ Unable to start server:');
    console.error(error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if PostgreSQL is running');
    console.error('   2. Verify DATABASE_URL in .env file');
    console.error('   3. Run: npm run migrate');
    console.error('   4. Check database credentials\n');
    process.exit(1);
  }
};

startServer();