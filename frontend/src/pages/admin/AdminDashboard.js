import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingProjects: 0,
    completedProjects: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/projects?limit=10')
      ]);
      
      setStats(statsRes.data);
      setRecentProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING_REVIEW: { className: 'badge-warning', text: 'Pending Review' },
      PLAN_READY: { className: 'badge-success', text: 'Plan Ready' },
      IN_PROGRESS: { className: 'badge-info', text: 'In Progress' },
      COMPLETED: { className: 'badge-primary', text: 'Completed' }
    };
    const badge = badges[status] || { className: 'badge-default', text: status };
    return <span className={`status-badge ${badge.className}`}>{badge.text}</span>;
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening with your STEM mentoring platform.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeStudents}</h3>
            <p>Active Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingProjects}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎉</div>
          <div className="stat-content">
            <h3>{stats.completedProjects}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/students" className="action-btn">
            <span className="btn-icon">👥</span>
            Manage Students
          </Link>
          <Link to="/admin/projects" className="action-btn">
            <span className="btn-icon">📝</span>
            Review Projects
          </Link>
        </div>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Project Submissions</h2>
          <Link to="/admin/projects" className="view-all">View All →</Link>
        </div>
        
        {recentProjects.length === 0 ? (
          <div className="empty-state">
            <p>No recent projects</p>
          </div>
        ) : (
          <div className="projects-table">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Project Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(project => (
                  <tr key={project.id}>
                    <td>{project.student_name}</td>
                    <td>{project.title}</td>
                    <td><span className="type-badge">{project.type}</span></td>
                    <td>{getStatusBadge(project.status)}</td>
                    <td>{new Date(project.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/admin/projects/${project.id}`} className="review-link">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;