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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🎯 Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening with your STEM mentoring platform.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.activeStudents}</div>
          <div className="stat-label">Active Students</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pendingProjects}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">🎉</div>
          <div className="stat-value">{stats.completedProjects}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="quick-actions glass-card">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/students" className="action-btn">
            <span className="btn-icon">👥</span>
            Manage Students
          </Link>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>📋 Recent Project Submissions</h2>
        </div>
        
        <div className="section-content glass-card">
          {recentProjects.length === 0 ? (
            <div className="empty-state">
              <p>No recent projects</p>
            </div>
          ) : (
            <div className="pending-projects">
              {recentProjects.map(project => (
                <div key={project.id} className="project-item">
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <div className="project-meta">
                      <span className="meta-item">👤 {project.student_name}</span>
                      <span className="meta-item">📦 {project.type}</span>
                      <span className="meta-item">📅 {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link to={`/admin/projects/${project.id}`} className="review-btn">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;