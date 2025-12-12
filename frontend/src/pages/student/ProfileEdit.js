import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ProfileEdit.css';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    age: '',
    school: '',
    country: 'India',
    bio: '',
    profile_picture: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setProfile({
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        age: response.data.age || '',
        school: response.data.school || '',
        country: response.data.country || 'India',
        bio: response.data.bio || '',
        profile_picture: response.data.profile_picture || ''
      });
      if (response.data.profile_picture) {
        setImagePreview(response.data.profile_picture);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ Image size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setProfile({ ...profile, profile_picture: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await axios.put('/api/auth/profile', profile);
      alert('✅ Profile updated successfully!');
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...storedUser, ...profile };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
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
        <button onClick={() => navigate('/student')} className="back-btn">← Back</button>
        <h1>✏️ Edit Profile</h1>
        <p>Update your personal information and profile picture</p>
      </div>

      <div className="profile-form-container glass-card">
        <form onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div className="profile-picture-section">
            <div className="avatar-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  <span>👤</span>
                </div>
              )}
            </div>
            <div className="upload-controls">
              <label htmlFor="profile-picture-input" className="upload-btn">
                📷 Choose Photo
              </label>
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <p className="upload-hint">JPG, PNG or GIF (Max 2MB)</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-row">
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
              <label>Email *</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                min="5"
                max="25"
                placeholder="Enter your age"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <select
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              >
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Zambia">Zambia</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>School/Institution</label>
            <input
              type="text"
              value={profile.school}
              onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              placeholder="e.g., Delhi Public School"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              placeholder="Tell us about yourself, your interests in STEM, goals..."
              maxLength={500}
            />
            <div className="char-count">{profile.bio.length}/500</div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/student')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : '✅ Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;