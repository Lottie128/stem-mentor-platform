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
          <div className="logo-icon animated-brain">
            <svg viewBox="0 0 100 100" width="40" height="40">
              <defs>
                <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className="gradient-start" />
                  <stop offset="100%" className="gradient-end" />
                </linearGradient>
              </defs>
              {/* Left hemisphere */}
              <path d="M 30 50 Q 20 30, 35 20 Q 40 15, 45 20 Q 48 18, 50 20" 
                    fill="none" stroke="url(#brainGradient)" strokeWidth="3" strokeLinecap="round"/>
              <path d="M 30 50 Q 25 60, 32 70 Q 38 75, 45 72 Q 48 74, 50 72" 
                    fill="none" stroke="url(#brainGradient)" strokeWidth="3" strokeLinecap="round"/>
              <path d="M 35 35 Q 30 40, 35 45" 
                    fill="none" stroke="url(#brainGradient)" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M 35 55 Q 30 60, 35 65" 
                    fill="none" stroke="url(#brainGradient)" strokeWidth="2.5" strokeLinecap="round"/>
              
              {/* Right hemisphere */}
              <path d="M 70 50 Q 80 30, 65 20 Q 60 15, 55 20 Q 52 18, 50 20" 
                    fill="none" stroke="url(#brainGradient)" strokeWidth="3" strokeLinecap="round"/>
              <path d="M 70 50 Q 75 60, 68 70 Q 62 75, 55 72 Q 52 74, 50 72" 
                    fill="none" stroke="url(#brainGradient)" strokeWidth="3" strokeLinecap="round"/>
              <path d="M 65 35 Q 70 40, 65 45" 
                    fill="none" stroke="url(#brainGradient)" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M 65 55 Q 70 60, 65 65" 
                    fill="none" stroke="url(#brainGradient)" strokeWidth="2.5" strokeLinecap="round"/>
              
              {/* Neural connections */}
              <circle cx="35" cy="30" r="2" fill="url(#brainGradient)" className="pulse-node"/>
              <circle cx="45" cy="40" r="2" fill="url(#brainGradient)" className="pulse-node" style={{animationDelay: '0.3s'}}/>
              <circle cx="35" cy="60" r="2" fill="url(#brainGradient)" className="pulse-node" style={{animationDelay: '0.6s'}}/>
              <circle cx="65" cy="30" r="2" fill="url(#brainGradient)" className="pulse-node" style={{animationDelay: '0.2s'}}/>
              <circle cx="55" cy="40" r="2" fill="url(#brainGradient)" className="pulse-node" style={{animationDelay: '0.5s'}}/>
              <circle cx="65" cy="60" r="2" fill="url(#brainGradient)" className="pulse-node" style={{animationDelay: '0.4s'}}/>
            </svg>
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