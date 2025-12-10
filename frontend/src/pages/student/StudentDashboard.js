import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/student/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING_REVIEW: { className: 'badge-warning', text: 'Under Review' },
      PLAN_READY: { className: 'badge-success', text: 'Plan Ready' },
      IN_PROGRESS: { className: 'badge-info', text: 'In Progress' },
      COMPLETED: { className: 'badge-primary', text: 'Completed' }
    };
    return badges[status] || { className: 'badge-default', text: status };
  };

  if (loading) return <div className="loading">Loading your projects...</div>;

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>My Projects</h1>
        <Link to="/student/submit" className="submit-btn">+ Submit New Project</Link>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h2>No Projects Yet</h2>
          <p>Start your STEM journey by submitting your first project idea!</p>
          <Link to="/student/submit" className="get-started-btn">Get Started</Link>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const badge = getStatusBadge(project.status);
            return (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>{project.title}</h3>
                  <span className={`status-badge ${badge.className}`}>{badge.text}</span>
                </div>
                <div className="project-body">
                  <p><strong>Type:</strong> {project.type}</p>
                  <p><strong>Experience:</strong> {project.experience_level}</p>
                  <p><strong>Deadline:</strong> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}</p>
                  <p><strong>Submitted:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <div className="project-footer">
                  {project.status === 'PENDING_REVIEW' ? (
                    <p className="waiting-text">⏳ Waiting for mentor review...</p>
                  ) : (
                    <Link to={`/student/projects/${project.id}`} className="view-btn">
                      View Plan →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;