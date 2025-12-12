import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ProjectView.css';

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/student/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStepStatus = async (stepIndex, newStatus) => {
    try {
      await axios.patch(`/api/student/projects/${projectId}/steps/${stepIndex}`, {
        status: newStatus
      });
      fetchProject();
    } catch (error) {
      alert('Failed to update step status');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      not_started: '⚪',
      in_progress: '🔵',
      done: '✅'
    };
    return icons[status] || '⚪';
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="error">Project not found</div>;
  if (!project.plan) return <div className="waiting">⏳ Your project plan is being prepared by your mentor...</div>;

  return (
    <div className="project-view">
      <div className="view-header">
        <button onClick={() => navigate('/student')} className="back-btn">← Back</button>
        <h1>{project.title}</h1>
      </div>

      <div className="project-info-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Type:</span>
            <span className="info-value">{project.type}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Experience:</span>
            <span className="info-value">{project.experience_level}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Budget:</span>
            <span className="info-value">{project.budget_range}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Deadline:</span>
            <span className="info-value">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}</span>
          </div>
        </div>
      </div>

      {project.plan.safety_notes && (
        <div className="safety-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3>Safety Notes</h3>
            <p>{project.plan.safety_notes}</p>
          </div>
        </div>
      )}

      <div className="components-card">
        <h2>📦 Components Needed</h2>
        <div className="components-grid">
          {project.plan.components.map((component, index) => (
            <div key={index} className="component-item">
              <div className="component-header">
                <h4>{component.name}</h4>
                {component.estimated_cost && (
                  <span className="component-cost">{component.estimated_cost}</span>
                )}
              </div>
              <p>{component.description}</p>
              {component.quantity && (
                <span className="component-qty">Qty: {component.quantity}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="steps-card">
        <h2>🔨 Build Steps</h2>
        <div className="steps-list">
          {project.plan.steps.map((step, index) => (
            <div key={index} className={`step-item ${step.status || 'not_started'}`}>
              <div className="step-header">
                <div className="step-number">Step {step.step}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-tag">
                  {step.tag === 'center' ? '🏫 At Center' : '🏠 At Home'}
                </div>
              </div>
              <p className="step-description">{step.description}</p>
              <div className="step-footer">
                <div className="step-status-buttons">
                  <button
                    onClick={() => updateStepStatus(index, 'not_started')}
                    className={`status-btn ${(step.status || 'not_started') === 'not_started' ? 'active' : ''}`}
                  >
                    {getStatusIcon('not_started')} Not Started
                  </button>
                  <button
                    onClick={() => updateStepStatus(index, 'in_progress')}
                    className={`status-btn ${step.status === 'in_progress' ? 'active' : ''}`}
                  >
                    {getStatusIcon('in_progress')} In Progress
                  </button>
                  <button
                    onClick={() => updateStepStatus(index, 'done')}
                    className={`status-btn ${step.status === 'done' ? 'active' : ''}`}
                  >
                    {getStatusIcon('done')} Done
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectView;