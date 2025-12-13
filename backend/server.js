require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/awards', require('./routes/awards.routes'));
app.use('/api/certificates', require('./routes/certificates.routes'));
app.use('/api/portfolio', require('./routes/portfolio.routes'));
app.use('/api/submissions', require('./routes/submissions.routes'));
app.use('/api/ibr', require('./routes/ibr.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/password', require('./routes/password.routes'));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});