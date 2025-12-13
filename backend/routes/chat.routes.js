const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get AI chat history for student
router.get('/ai-history', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM chat_messages 
       WHERE student_id = $1 AND chat_type = 'ai'
       ORDER BY created_at ASC`,
      [req.user.id]
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
    await db.query(
      `INSERT INTO chat_messages (student_id, chat_type, role, content)
       VALUES ($1, 'ai', 'user', $2)`,
      [req.user.id, message]
    );
    
    // Get AI response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `You are a friendly STEM education mentor assistant. Help students with their science, technology, engineering, and math questions. Be encouraging and educational.\n\nStudent question: ${message}`;
    
    const result = await model.generateContent(prompt);
    const aiReply = result.response.text();
    
    // Save AI response
    await db.query(
      `INSERT INTO chat_messages (student_id, chat_type, role, content)
       VALUES ($1, 'ai', 'assistant', $2)`,
      [req.user.id, aiReply]
    );
    
    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Get teacher chat history for student
router.get('/teacher-history', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM chat_messages 
       WHERE student_id = $1 AND chat_type = 'teacher'
       ORDER BY created_at ASC`,
      [req.user.id]
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

// Send message to teacher
router.post('/teacher', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    
    await db.query(
      `INSERT INTO chat_messages (student_id, chat_type, role, content)
       VALUES ($1, 'teacher', 'student', $2)`,
      [req.user.id, message]
    );
    
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
    
    const { rows } = await db.query(
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

// Admin: Reply to student
router.post('/admin/reply/:studentId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { message } = req.body;
    const { studentId } = req.params;
    
    await db.query(
      `INSERT INTO chat_messages (student_id, chat_type, role, content)
       VALUES ($1, 'teacher', 'admin', $2)`,
      [studentId, message]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending admin reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

module.exports = router;