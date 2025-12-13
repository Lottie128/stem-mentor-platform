const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');
const crypto = require('crypto');

// Student: Reset own password
router.post('/reset', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    // Get current user
    const { rows } = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = rows[0];
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Admin: Generate new password for student
router.post('/admin/generate/:studentId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { studentId } = req.params;
    
    // Generate random password
    const newPassword = crypto.randomBytes(4).toString('hex'); // 8 characters
    
    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update student password
    const { rows } = await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING email, full_name',
      [hashedPassword, studentId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({
      success: true,
      student: rows[0],
      newPassword: newPassword,
      message: 'Password generated successfully. Please share this with the student securely.'
    });
  } catch (error) {
    console.error('Error generating password:', error);
    res.status(500).json({ error: 'Failed to generate password' });
  }
});

module.exports = router;