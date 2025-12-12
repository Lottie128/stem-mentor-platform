import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Portfolio.css';

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    social_links: {},
    is_public: false,
    theme_color: '#8b5cf6'
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio/me/portfolio');
      setPortfolio(response.data);
      setFormData({
        bio: response.data.bio || '',
        skills: response.data.skills || [],
        social_links: response.data.social_links || {},
        is_public: response.data.is_public || false,
        theme_color: response.data.theme_color || '#8b5cf6'
      });
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/portfolio/me/portfolio', formData);
      alert('✅ Portfolio updated successfully!');
      fetchPortfolio();
    } catch (error) {
      alert('❌ Failed to update portfolio');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const portfolioUrl = portfolio ? `${window.location.origin}/portfolio/${portfolio.slug}` : '';

  if (loading) return <div className="loading">Loading portfolio...</div>;

  return (
    <div className="portfolio-page">
      <div className="page-header glass-card">
        <button onClick={() => navigate('/student')} className="back-btn">← Back</button>
        <div>
          <h1 className="gradient-text">💼 My Portfolio</h1>
          <p>Create your public portfolio to showcase your projects and achievements</p>
        </div>
      </div>

      {portfolio && formData.is_public && (
        <div className="portfolio-link-card glass-card">
          <div className="link-header">
            <h3>🌐 Your Public Portfolio</h3>
            <span className="live-badge">• Live</span>
          </div>
          <div className="link-display">
            <input type="text" value={portfolioUrl} readOnly />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(portfolioUrl);
                alert('✅ Link copied to clipboard!');
              }}
              className="copy-btn"
            >
              📋 Copy
            </button>
            <button 
              onClick={() => window.open(portfolioUrl, '_blank')}
              className="visit-btn"
            >
              🔗 Visit
            </button>
          </div>
        </div>
      )}

      <div className="editor-form glass-card">
        <div className="form-section">
          <h3>✍️ Bio</h3>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell the world about yourself, your interests, and your STEM goals...\n\nExample: I'm a 14-year-old maker passionate about robotics and AI. I love building things that solve real-world problems!"
            rows={6}
          />
        </div>

        <div className="form-section">
          <h3>🛠️ Skills</h3>
          <div className="skills-input">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill (e.g., Arduino, Python, 3D Printing)"
            />
            <button onClick={addSkill} className="add-skill-btn">+ Add</button>
          </div>
          <div className="skills-list">
            {formData.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button onClick={() => removeSkill(index)} className="remove-skill">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>🔗 Social Links</h3>
          <div className="social-inputs">
            <div className="social-input-group">
              <span className="social-icon">🐱</span>
              <input
                type="text"
                placeholder="GitHub Username"
                value={formData.social_links.github || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, github: e.target.value }
                })}
              />
            </div>
            <div className="social-input-group">
              <span className="social-icon">💼</span>
              <input
                type="text"
                placeholder="LinkedIn Username"
                value={formData.social_links.linkedin || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, linkedin: e.target.value }
                })}
              />
            </div>
            <div className="social-input-group">
              <span className="social-icon">🐦</span>
              <input
                type="text"
                placeholder="Twitter Username"
                value={formData.social_links.twitter || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, twitter: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>🎨 Theme Color</h3>
          <div className="color-picker-group">
            <input
              type="color"
              value={formData.theme_color}
              onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
            />
            <span className="color-value">{formData.theme_color}</span>
          </div>
        </div>

        <div className="form-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
            />
            <span className="checkbox-text">
              <strong>Make my portfolio public</strong>
              <small>Allow anyone with the link to view your projects and achievements</small>
            </span>
          </label>
        </div>

        <div className="form-actions">
          <button onClick={() => navigate('/student')} className="cancel-btn">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="save-btn">
            {saving ? '⏳ Saving...' : '✅ Save Portfolio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;