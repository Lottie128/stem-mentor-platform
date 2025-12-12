import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ProfileEdit.css';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    school: '',
    country: 'India',
    bio: '',
    profile_picture: '',
    skills: [],
    social_links: {
      github: '',
      linkedin: '',
      youtube: '',
      twitter: '',
      website: ''
    }
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setProfile({
        full_name: response.data.full_name || '',
        age: response.data.age || '',
        school: response.data.school || '',
        country: response.data.country || 'India',
        bio: response.data.bio || '',
        profile_picture: response.data.profile_picture || '',
        skills: response.data.skills || [],
        social_links: response.data.social_links || {
          github: '',
          linkedin: '',
          youtube: '',
          twitter: '',
          website: ''
        }
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('⚠️ Image too large! Please upload an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, profile_picture: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const handleSocialLinkChange = (platform, value) => {
    setProfile({
      ...profile,
      social_links: {
        ...profile.social_links,
        [platform]: value
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/auth/profile', profile);
      alert('✅ Profile updated successfully!');
      navigate('/student');
    } catch (error) {
      alert('❌ Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-edit">
      <div className="profile-header glass-card">
        <h1>✏️ Edit Profile</h1>
        <p>Update your information to showcase on your portfolio</p>
      </div>

      <div className="profile-form glass-card">
        {/* Profile Picture */}
        <div className="form-section">
          <h3>📸 Profile Picture</h3>
          <div className="profile-picture-upload">
            {profile.profile_picture ? (
              <img src={profile.profile_picture} alt="Profile" className="preview-image" />
            ) : (
              <div className="preview-placeholder">👤</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="profile-pic"
              style={{ display: 'none' }}
            />
            <label htmlFor="profile-pic" className="upload-btn">
              📷 {profile.profile_picture ? 'Change' : 'Upload'} Photo
            </label>
            <p className="help-text">Max size: 2MB</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <h3>📄 Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>School</label>
              <input
                type="text"
                value={profile.school}
                onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself, your interests, and your STEM journey..."
              rows={4}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="form-section">
          <h3>🛠️ Skills</h3>
          <div className="skills-input">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g., Arduino, Python, 3D Design"
            />
            <button onClick={addSkill} className="add-skill-btn">➕ Add</button>
          </div>
          <div className="skills-list">
            {profile.skills.map((skill, index) => (
              <div key={index} className="skill-tag">
                {skill}
                <button onClick={() => removeSkill(skill)} className="remove-skill">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="form-section">
          <h3>🔗 Social Links</h3>
          <div className="social-links-grid">
            <div className="form-group">
              <label>🐙 GitHub</label>
              <input
                type="url"
                value={profile.social_links.github}
                onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="form-group">
              <label>💔 LinkedIn</label>
              <input
                type="url"
                value={profile.social_links.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="form-group">
              <label>🎥 YouTube</label>
              <input
                type="url"
                value={profile.social_links.youtube}
                onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                placeholder="https://youtube.com/@username"
              />
            </div>
            <div className="form-group">
              <label>🐦 Twitter/X</label>
              <input
                type="url"
                value={profile.social_links.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="form-group full-width">
              <label>🌐 Website</label>
              <input
                type="url"
                value={profile.social_links.website}
                onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={() => navigate('/student')} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="save-btn">
            {saving ? '⏳ Saving...' : '✅ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;