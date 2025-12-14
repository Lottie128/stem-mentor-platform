import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ChangePassword.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/password/change', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/student');
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="change-password-page">
        <div className="success-card glass-card">
          <div className="success-icon">✅</div>
          <h2>Password Changed Successfully!</h2>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="change-password-page">
      <div className="change-password-card glass-card">
        <div className="card-header">
          <button onClick={() => navigate('/student')} className="back-btn">← Back</button>
          <h1>🔐 Change Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              placeholder="Enter new password (min 6 characters)"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Confirm new password"
              required
              minLength={6}
            />
          </div>

          <div className="security-tips glass-card">
            <h4>🛡️ Password Security Tips</h4>
            <ul>
              <li>Use at least 6 characters</li>
              <li>Mix letters, numbers, and symbols</li>
              <li>Don't reuse old passwords</li>
              <li>Don't share your password with anyone</li>
            </ul>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Changing Password...' : '✅ Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;