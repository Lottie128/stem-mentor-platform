const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const crypto = require('crypto');

// In-memory storage for reset tokens (in production, use Redis or database)
const resetTokens = new Map();

// Student: Change own password (when logged in)
router.post('/change', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Student: Request password reset (generates reset link)
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ where: { email, role: 'STUDENT' } });
    
    // Always return success even if user not found (security best practice)
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = Date.now() + 3600000; // 1 hour
    
    // Store token (in production, store in database)
    resetTokens.set(resetToken, {
      userId: user.id,
      email: user.email,
      expiry: resetExpiry
    });
    
    // In production, send email with reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    console.log(`\n🔐 Password Reset Request`);
    console.log(`User: ${user.email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`Token expires in 1 hour\n`);
    
    // TODO: Send email with resetLink
    // For now, return the link in response (remove in production)
    res.json({ 
      message: 'If the email exists, a reset link has been sent',
      // DEVELOPMENT ONLY - remove in production
      resetLink: resetLink,
      note: 'In production, this link will be sent via email'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Failed to process reset request' });
  }
});

// Student: Verify reset token
router.get('/verify-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired reset token' });
    }
    
    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ valid: false, message: 'Reset token has expired' });
    }
    
    res.json({ 
      valid: true, 
      email: tokenData.email 
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ valid: false, message: 'Failed to verify token' });
  }
});

// Student: Reset password with token
router.post('/reset-with-token', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    
    // Update password
    const user = await User.findByPk(tokenData.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    await user.save();
    
    // Delete used token
    resetTokens.delete(token);
    
    console.log(`✅ Password reset successful for ${user.email}`);
    
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Admin: Reset student password (instant, no email)
router.post('/admin/reset/:studentId', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newPassword } = req.body;
    
    let password = newPassword;
    
    // If no password provided, generate one
    if (!password) {
      password = crypto.randomBytes(4).toString('hex'); // 8 characters
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const student = await User.findOne({ 
      where: { id: studentId, role: 'STUDENT' } 
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    student.password_hash = hashedPassword;
    await student.save();
    
    console.log(`✅ Admin reset password for ${student.email}`);
    
    res.json({
      message: 'Password reset successfully',
      student: {
        email: student.email,
        full_name: student.full_name
      },
      newPassword: password
    });
  } catch (error) {
    console.error('Error resetting student password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

module.exports = router;