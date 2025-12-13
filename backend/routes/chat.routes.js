const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get AI chat history for student
router.get('/ai-history', authenticate, async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT * FROM chat_messages 
       WHERE student_id = :studentId AND chat_type = 'ai'
       ORDER BY created_at ASC`,
      { replacements: { studentId: req.user.id } }
    );
    
    const messages = rows.map(row => ({
      role: row.role,
      content: row.content,
      timestamp: row.created_at
    }));
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching AI chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send message to AI
router.post('/ai', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Save user message
    await sequelize.query(
      `INSERT INTO chat_messages (student_id, chat_type, role, content)
       VALUES (:studentId, 'ai', 'user', :message)`,
      { replacements: { studentId: req.user.id, message } }
    );
    
    // Use Gemini 2.5 Flash - stable model with best price-performance
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a friendly STEM education mentor assistant. Help students with their science, technology, engineering, and math questions. Be encouraging and educational.\n\nStudent question: ${message}`;
    
    const result = await model.generateContent(prompt);
    const aiReply = result.response.text();
    
    // Save AI response
    await sequelize.query(
      `INSERT INTO chat_messages (student_id, chat_type, role, content)
       VALUES (:studentId, 'ai', 'assistant', :aiReply)`,
      { replacements: { studentId: req.user.id, aiReply } }
    );
    
    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Failed to get AI response: ' + error.message });
  }
});

// Get teacher chat history for student
router.get('/teacher-history', authenticate, async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT * FROM chat_messages 
       WHERE student_id = :studentId AND chat_type = 'teacher'
       ORDER BY created_at ASC`,
      { replacements: { studentId: req.user.id } }
    );
    
    const messages = rows.map(row => ({
      role: row.role,
      content: row.content,
      timestamp: row.created_at
    }));
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching teacher chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send message to teacher (with real-time notification)
router.post('/teacher', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    
    await sequelize.query(
      `INSERT INTO chat_messages (student_id, chat_type, role, content)
       VALUES (:studentId, 'teacher', 'student', :message)`,
      { replacements: { studentId: req.user.id, message } }
    );
    
    // Emit real-time notification to admin
    const io = req.app.get('io');
    io.to('admin_room').emit('new_student_message', {
      student_id: req.user.id,
      student_name: req.user.full_name,
      message: message,
      timestamp: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message to teacher:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Admin: Get all teacher messages
router.get('/admin/messages', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [rows] = await sequelize.query(
      `SELECT cm.*, u.full_name, u.email, u.profile_picture
       FROM chat_messages cm
       JOIN users u ON cm.student_id = u.id
       WHERE cm.chat_type = 'teacher'
       ORDER BY u.full_name, cm.created_at ASC`
    );
    
    // Group by student
    const messagesByStudent = {};
    rows.forEach(row => {
      if (!messagesByStudent[row.student_id]) {
        messagesByStudent[row.student_id] = {
          student_id: row.student_id,
          full_name: row.full_name,
          email: row.email,
          profile_picture: row.profile_picture,
          messages: []
        };
      }
      messagesByStudent[row.student_id].messages.push({
        id: row.id,
        role: row.role,
        content: row.content,
        created_at: row.created_at
      });
    });
    
    res.json(Object.values(messagesByStudent));
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Admin: Reply to student (with real-time notification)
router.post('/admin/reply/:studentId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { message } = req.body;
    const { studentId } = req.params;
    
    await sequelize.query(
      `INSERT INTO chat_messages (student_id, chat_type, role, content)
       VALUES (:studentId, 'teacher', 'admin', :message)`,
      { replacements: { studentId, message } }
    );
    
    // Emit real-time notification to student
    const io = req.app.get('io');
    io.to(`user_${studentId}`).emit('new_teacher_message', {
      message: message,
      timestamp: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending admin reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Get unread message count for admin
router.get('/admin/unread-count', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [result] = await sequelize.query(
      `SELECT COUNT(DISTINCT student_id) as unread_students
       FROM chat_messages
       WHERE chat_type = 'teacher' 
       AND role = 'student'
       AND created_at > COALESCE(
         (SELECT MAX(created_at) 
          FROM chat_messages cm2 
          WHERE cm2.student_id = chat_messages.student_id 
          AND cm2.role = 'admin'),
         '1970-01-01'
       )`
    );
    
    res.json({ count: parseInt(result[0].unread_students) || 0 });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

module.exports = router;