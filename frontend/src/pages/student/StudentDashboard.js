import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [awards, setAwards] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, awardsRes, certsRes] = await Promise.all([
        axios.get('/api/student/projects'),
        axios.get('/api/awards/me'),
        axios.get('/api/certificates/my-certificates')
      ]);
      
      setProjects(projectsRes.data);
      setAwards(awardsRes.data);
      setCertificates(certsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING_REVIEW: { className: 'badge-warning', text: 'Under Review', icon: '⏳' },
      PLAN_READY: { className: 'badge-success', text: 'Plan Ready', icon: '✅' },
      IN_PROGRESS: { className: 'badge-info', text: 'In Progress', icon: '🔵' },
      COMPLETED: { className: 'badge-primary', text: 'Completed', icon: '🎉' }
    };
    return badges[status] || { className: 'badge-default', text: status, icon: '⚪' };
  };

  const completedProjects = projects.filter(p => p.status === 'COMPLETED');
  const hasCompletedProjects = completedProjects.length > 0;

  if (loading) return <div className="loading">Loading your dashboard...</div>;

  return (
    <div className="student-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero glass-card">
        <div className="hero-content">
          <h1 className="gradient-text">Welcome Back! 👋</h1>
          <p>Track your STEM journey, earn achievements, and showcase your work</p>
        </div>
        <div className="hero-actions">
          <Link to="/student/submit" className="primary-btn">
            <span className="btn-icon">➕</span>
            Submit New Project
          </Link>
          <Link to="/student/portfolio" className="secondary-btn">
            <span className="btn-icon">📂</span>
            My Portfolio
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{completedProjects.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{awards.length}</div>
          <div className="stat-label">Awards</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-value">{certificates.length}</div>
          <div className="stat-label">Certificates</div>
        </div>
      </div>

      {/* Achievements Section */}
      {awards.length > 0 && (
        <div className="achievements-section">
          <div className="section-header">
            <h2>🏅 Recent Achievements</h2>
            <Link to="/student/awards" className="view-all-link">View All →</Link>
          </div>
          <div className="achievements-grid">
            {awards.slice(0, 3).map(award => (
              <div key={award.id} className="achievement-badge glass-card">
                <div className="badge-icon">{award.icon}</div>
                <div className="badge-title">{award.title}</div>
                <div className="badge-date">{new Date(award.awarded_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IBR Application Button */}
      {hasCompletedProjects && (
        <div className="ibr-cta glass-card">
          <div className="ibr-content">
            <div className="ibr-icon">🇮🇳</div>
            <div>
              <h3>Apply for India Book of Records</h3>
              <p>You have {completedProjects.length} completed project(s) ready for IBR application!</p>
            </div>
          </div>
          <Link to="/student/ibr-apply" className="ibr-btn">
            Apply Now →
          </Link>
        </div>
      )}

      {/* Projects Section */}
      <div className="projects-section">
        <div className="section-header">
          <h2>📁 My Projects</h2>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state glass-card">
            <div className="empty-icon">💡</div>
            <h3>No Projects Yet</h3>
            <p>Start your STEM journey by submitting your first project idea!</p>
            <Link to="/student/submit" className="get-started-btn">Get Started</Link>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => {
              const badge = getStatusBadge(project.status);
              return (
                <div key={project.id} className="project-card glass-card">
                  <div className="project-header">
                    <div className="project-type-badge">{project.type}</div>
                    <span className={`status-badge ${badge.className}`}>
                      {badge.icon} {badge.text}
                    </span>
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  <div className="project-meta">
                    <div className="meta-item">
                      <span className="meta-label">Level:</span>
                      <span className="meta-value">{project.experience_level}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Budget:</span>
                      <span className="meta-value">{project.budget_range}</span>
                    </div>
                  </div>
                  <div className="project-footer">
                    {project.status === 'PENDING_REVIEW' ? (
                      <div className="waiting-text">⏳ Waiting for mentor review...</div>
                    ) : (
                      <Link to={`/student/projects/${project.id}`} className="view-project-btn">
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;