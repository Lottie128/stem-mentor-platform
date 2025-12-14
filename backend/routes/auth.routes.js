const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth.middleware');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is inactive', inactive: true });
    }

    // Check if account expired
    if (user.expires_at && new Date(user.expires_at) < new Date()) {
      return res.status(403).json({ message: 'Account has expired', inactive: true });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        profile_picture: user.profile_picture,
        age: user.age,
        school: user.school,
        country: user.country,
        bio: user.bio,
        skills: user.skills,
        social_links: user.social_links
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name, age, school, country, bio, profile_picture, skills, social_links } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields - convert empty strings to null for numeric/optional fields
    if (full_name !== undefined) user.full_name = full_name;
    
    // Age: convert empty string to null for integer field
    if (age !== undefined) {
      user.age = age === '' || age === null ? null : parseInt(age, 10);
    }
    
    // School: convert empty string to null
    if (school !== undefined) {
      user.school = school === '' ? null : school;
    }
    
    // Country: convert empty string to null
    if (country !== undefined) {
      user.country = country === '' ? null : country;
    }
    
    // Bio: convert empty string to null
    if (bio !== undefined) {
      user.bio = bio === '' ? null : bio;
    }
    
    // Profile picture: convert empty string to null
    if (profile_picture !== undefined) {
      user.profile_picture = profile_picture === '' ? null : profile_picture;
    }
    
    if (skills !== undefined) user.skills = skills;
    if (social_links !== undefined) user.social_links = social_links;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

module.exports = router;