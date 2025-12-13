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
      return user.email;
    }
    return '';
  };

  return (
    <header className="app-header glass-card">
      <div className="header-container">
        <Link to={user?.role === 'ADMIN' ? '/admin' : '/student'} className="logo">
          <div className="header-logo">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="45" height="45">
              <defs>
                <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              {/* S Letter */}
              <path 
                className="header-logo-path header-logo-s"
                d="M 35 25 Q 20 25 20 35 Q 20 45 35 45 L 55 45 Q 70 45 70 55 Q 70 65 55 65 L 25 65"
                stroke="url(#headerGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              
              {/* T Letter */}
              <path 
                className="header-logo-path header-logo-t"
                d="M 50 30 L 80 30 M 65 30 L 65 70"
                stroke="url(#headerGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              
              {/* Orbiting dots */}
              <circle className="header-orbit-dot header-dot-1" cx="50" cy="50" r="2.5" fill="#a78bfa" />
              <circle className="header-orbit-dot header-dot-2" cx="50" cy="50" r="2.5" fill="#ec4899" />
              <circle className="header-orbit-dot header-dot-3" cx="50" cy="50" r="2.5" fill="#f59e0b" />
            </svg>
          </div>
          <span className="logo-text">STEM Mentor</span>
        </Link>

        <nav className="nav-links">
          {user?.role === 'ADMIN' ? (
            <>
              <Link to="/admin" className="nav-link">🏠 Dashboard</Link>
              <Link to="/admin/students" className="nav-link">👥 Students</Link>
              <Link to="/admin/ibr" className="nav-link">🇮🇳 IBR</Link>
            </>
          ) : (
            <>
              <Link to="/student" className="nav-link">🏠 Dashboard</Link>
              <Link to="/student/submit" className="nav-link">➕ New Project</Link>
              <Link to="/student/awards" className="nav-link">🏆 Awards</Link>
              <Link to="/student/profile" className="nav-link">⚙️ Settings</Link>
              <Link to={`/portfolio/${getPortfolioUsername()}`} className="nav-link public-link" target="_blank">
                🌐 View Public Portfolio
              </Link>
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
            🚺 Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;