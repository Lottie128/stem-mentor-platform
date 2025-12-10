import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotActive.css';

const NotActive = () => {
  return (
    <div className="not-active-container">
      <div className="not-active-card">
        <div className="icon-warning">⚠️</div>
        <h1>Account Not Active</h1>
        <p>Your account is currently inactive. This could be due to:</p>
        <ul>
          <li>Pending payment verification</li>
          <li>Subscription expiration</li>
          <li>Administrative review</li>
        </ul>
        <p className="contact-text">
          Please contact your mentor to activate your account.
        </p>
        <div className="contact-info">
          <p><strong>Email:</strong> support@stemmentor.com</p>
          <p><strong>Phone:</strong> +260 XXX XXX XXX</p>
        </div>
        <Link to="/login" className="back-button">Back to Login</Link>
      </div>
    </div>
  );
};

export default NotActive;