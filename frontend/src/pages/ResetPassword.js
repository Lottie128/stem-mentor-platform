import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`/api/password/verify-token/${token}`);
      if (response.data.valid) {
        setValid(true);
        setEmail(response.data.email);
      } else {
        setValid(false);
      }
    } catch (error) {
      setValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post('/api/password/reset-with-token', {
        token,
        newPassword
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-card">
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <h1>❌ Invalid Reset Link</h1>
          </div>
          <div className="error-message">
            <p>This password reset link is invalid or has expired.</p>
            <p>Please request a new password reset.</p>
            <Link to="/forgot-password" className="submit-btn">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <h1>✅ Password Reset Successful!</h1>
          </div>
          <div className="success-message">
            <p>Your password has been reset successfully.</p>
            <p>Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <h1>🔐 Reset Password</h1>
          <p>Creating new password for <strong>{email}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Resetting...' : '✅ Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;