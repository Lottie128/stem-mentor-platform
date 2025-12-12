import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getPortfolioUsername = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return '';
  };

  return (
    <header className="app-header glass-card">
      <div className="header-container">
        <Link to={user?.role === 'ADMIN' ? '/admin' : '/student'} className="logo">
          <div className="logo-icon animated-st">
            <span className="st-s">S</span>
            <span className="st-t">T</span>
          </div>
          <span className="logo-text">STEM Mentor</span>
        </Link>

        <nav className="nav-links">
          {user?.role === 'ADMIN' ? (
            <>
              <Link to="/admin" className="nav-link">🏠 Dashboard</Link>
              <Link to="/admin/students" className="nav-link">👥 Students</Link>
            </>
          ) : (
            <>
              <Link to="/student" className="nav-link">🏠 Dashboard</Link>
              <Link to="/student/submit" className="nav-link">➕ New Project</Link>
              <Link to="/student/awards" className="nav-link">🏆 Awards</Link>
              <Link to={`/portfolio/${getPortfolioUsername()}`} className="nav-link" target="_blank">👤 Portfolio</Link>
              <Link to="/student/profile" className="nav-link">✏️ Profile</Link>
            </>
          )}
        </nav>

        <div className="user-section">
          <div className="user-info">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user?.full_name} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">
                {user?.full_name?.charAt(0) || '👤'}
              </div>
            )}
            <div className="user-details">
              <span className="user-name">{user?.full_name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;