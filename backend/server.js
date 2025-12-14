require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize, testConnection } = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());

// Increase body size limit for large profile pictures and data uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/portfolio', require('./routes/portfolio.routes'));
app.use('/api/certificates', require('./routes/certificates.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/password', require('./routes/password.routes'));
app.use('/api/awards', require('./routes/awards.routes'));
app.use('/api/submissions', require('./routes/submissions.routes'));
app.use('/api/ibr', require('./routes/ibr.routes')); // IBR routes added

// Socket.io connection
io.on('connection', (socket) => {
  console.log('\u2705 User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  // Join admin to admin room
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log('Admin joined admin_room');
  });

  socket.on('disconnect', () => {
    console.log('\u274c User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// Test database connection and start server
testConnection().then(() => {
  server.listen(PORT, () => {
    console.log(`\ud83d\ude80 Server running on port ${PORT}`);
  });
});

module.exports = { io };