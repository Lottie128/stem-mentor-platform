import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/password/request-reset', { email });
      setSent(true);
      // In development, show the reset link
      if (response.data.resetLink) {
        setResetLink(response.data.resetLink);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <h1>✅ Check Your Email</h1>
          </div>
          <div className="success-message">
            <p>If an account exists with <strong>{email}</strong>, you will receive a password reset link.</p>
            
            {/* DEVELOPMENT ONLY - Remove in production */}
            {resetLink && (
              <div className="dev-notice">
                <p><strong>🛠️ Development Mode:</strong></p>
                <p>In production, this link will be sent via email. For now, click below:</p>
                <a href={resetLink} className="reset-link-btn">
                  🔐 Reset Password
                </a>
              </div>
            )}
            
            <p className="back-link">
              <Link to="/login">← Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <h1>🔐 Forgot Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : '📧 Send Reset Link'}
          </button>

          <p className="back-link">
            <Link to="/login">← Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;