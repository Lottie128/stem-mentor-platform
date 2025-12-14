import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="app-header glass-card">
      <div className="header-container">
        <Link to={user.role === 'ADMIN' ? '/admin' : '/student'} className="logo">
          <span className="logo-icon">🔬</span>
          <span className="logo-text">STEM Mentor</span>
        </Link>

        <nav className="header-nav">
          {user.role === 'ADMIN' ? (
            <>
              <Link to="/admin" className="nav-link">🏠 Dashboard</Link>
              <Link to="/admin/students" className="nav-link">🎓 Students</Link>
              <Link to="/admin/ibr" className="nav-link">🇮🇳 IBR</Link>
              <Link to="/admin/messages" className="nav-link">💬 Messages</Link>
            </>
          ) : (
            <>
              <Link to="/student" className="nav-link">🏠 Dashboard</Link>
              <Link to="/student/submit" className="nav-link">+ New Project</Link>
              <Link to="/student/awards" className="nav-link">🏆 Awards</Link>
              <Link to="/student/profile" className="nav-link">👤 Profile</Link>
              <Link to="/student/change-password" className="nav-link">🔐 Change Password</Link>
            </>
          )}
        </nav>

        <div className="header-user">
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className="user-role">{user.role}</span>
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