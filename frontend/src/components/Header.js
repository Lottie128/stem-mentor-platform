import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to={user?.role === 'ADMIN' ? '/admin' : '/student'} className="logo-link">
          <AnimatedLogo size={50} />
          <div className="brand-text">
            <h1 className="brand-name">STEM Mentor</h1>
            <p className="brand-tagline">Project Planning Platform</p>
          </div>
        </Link>

        <nav className="header-nav">
          {user && (
            <>
              <span className="user-info">
                <span className="user-name">{user.full_name}</span>
                <span className="user-role">{user.role}</span>
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;