import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ProjectView.css';

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({
    video_link: '',
    images_link: '',
    notes: ''
  });

  const fetchProjectData = useCallback(async () => {
    try {
      const [projectRes, submissionsRes, certsRes] = await Promise.all([
        axios.get(`/api/student/projects/${projectId}`),
        axios.get(`/api/submissions/project/${projectId}`),
        axios.get('/api/certificates/my-certificates')
      ]);
      
      console.log('📥 Fetched project data:', {
        status: projectRes.data.status,
        is_public: projectRes.data.is_public,
        stepsTotal: projectRes.data.plan?.steps.length,
        stepsDone: projectRes.data.plan?.steps.filter(s => s.status === 'done').length
      });
      
      setProject(projectRes.data);
      setSubmissions(submissionsRes.data);
      setCertificates(certsRes.data.filter(c => c.project_id === parseInt(projectId)));
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const toggleVisibility = async () => {
    try {
      const response = await axios.patch(`/api/student/projects/${projectId}/visibility`, {
        is_public: !project.is_public
      });
      setProject(response.data.project);
      alert(`✅ Project is now ${response.data.project.is_public ? 'public' : 'private'}`);
    } catch (error) {
      alert('❌ Failed to update visibility');
    }
  };

  const openSubmissionModal = (step, stepIndex) => {
    setCurrentStep({ ...step, index: stepIndex });
    const existing = submissions.find(s => s.step_number === step.step);
    if (existing) {
      setSubmissionForm({
        video_link: existing.video_link || '',
        images_link: existing.images_link || '',
        notes: existing.notes || ''
      });
    } else {
      setSubmissionForm({ video_link: '', images_link: '', notes: '' });
    }
    setShowSubmissionModal(true);
  };

  const submitStepProof = async () => {
    try {
      await axios.post('/api/submissions', {
        project_id: projectId,
        step_number: currentStep.step,
        ...submissionForm
      });
      
      const response = await axios.patch(`/api/student/projects/${projectId}/steps/${currentStep.index}`, {
        status: 'done'
      });
      
      setProject(response.data);
      alert('✅ Step submission saved successfully!');
      setShowSubmissionModal(false);
      
      const [submissionsRes, certsRes] = await Promise.all([
        axios.get(`/api/submissions/project/${projectId}`),
        axios.get('/api/certificates/my-certificates')
      ]);
      
      setSubmissions(submissionsRes.data);
      setCertificates(certsRes.data.filter(c => c.project_id === parseInt(projectId)));
      
    } catch (error) {
      console.error('❌ Failed to submit step:', error);
      alert('❌ Failed to submit step');
    }
  };

  const updateStepStatus = async (stepIndex, newStatus) => {
    try {
      const response = await axios.patch(`/api/student/projects/${projectId}/steps/${stepIndex}`, {
        status: newStatus
      });
      setProject(response.data);
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

  const getSubmissionForStep = (stepNumber) => {
    return submissions.find(s => s.step_number === stepNumber);
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="error">Project not found</div>;
  if (!project.plan) {
    return (
      <div className="waiting-plan glass-card">
        <div className="waiting-icon">⏳</div>
        <h2>Your Project Plan is Being Prepared</h2>
        <p>Your mentor is creating a detailed, step-by-step plan for your project. Check back soon!</p>
        <button onClick={() => navigate('/student')} className="back-btn">Back to Dashboard</button>
      </div>
    );
  }

  const completedSteps = project.plan.steps.filter(s => s.status === 'done').length;
  const totalSteps = project.plan.steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const isCompleted = project.status === 'COMPLETED';

  return (
    <div className="project-view">
      {/* Header */}
      <div className="view-header glass-card">
        <button onClick={() => navigate('/student')} className="back-btn">← Back</button>
        <div className="header-content">
          <div className="title-row">
            <h1>{project.title}</h1>
            <button 
              onClick={toggleVisibility} 
              className={`visibility-toggle ${project.is_public ? 'public' : 'private'}`}
              title={project.is_public ? 'Click to make private' : 'Click to make public'}
            >
              {project.is_public ? '🌍 Public' : '🔒 Private'}
            </button>
          </div>
          <div className="progress-bar-container">
            <div className="progress-info">
              <span>Progress</span>
              <span>{completedSteps}/{totalSteps} steps ({progressPercentage}%)</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="project-info-card glass-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Type</span>
            <span className="info-value">{project.type}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Experience</span>
            <span className="info-value">{project.experience_level}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Budget</span>
            <span className="info-value">{project.budget_range}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status</span>
            <span className={`status-badge ${isCompleted ? 'completed' : 'in-progress'}`}>
              {isCompleted ? '✅ Completed' : '🔵 In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="certificates-section glass-card">
          <h2>🎓 Certificates Earned</h2>
          <div className="certificates-grid">
            {certificates.map(cert => (
              <a 
                key={cert.id} 
                href={`/certificate/${cert.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="certificate-card"
              >
                <div className="cert-icon">🏆</div>
                <h4>{cert.certificate_type.replace('_', ' ')}</h4>
                <p className="cert-number">{cert.certificate_number}</p>
                <p className="cert-date">{new Date(cert.issue_date).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Safety Notes */}
      {project.plan.safety_notes && (
        <div className="safety-alert glass-card">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3>Safety Notes</h3>
            <p>{project.plan.safety_notes}</p>
          </div>
        </div>
      )}

      {/* Components */}
      <div className="components-card glass-card">
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

      {/* Build Steps */}
      <div className="steps-card glass-card">
        <h2>🔨 Build Steps</h2>
        <div className="steps-list">
          {project.plan.steps.map((step, index) => {
            const submission = getSubmissionForStep(step.step);
            return (
              <div key={index} className={`step-item ${step.status || 'not_started'}`}>
                <div className="step-header">
                  <div className="step-number">Step {step.step}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-tag">
                    {step.tag === 'center' ? '🏫 At Center' : '🏠 At Home'}
                  </div>
                </div>
                <p className="step-description">{step.description}</p>
                
                {/* Submission Info */}
                {submission && (
                  <div className="submission-info">
                    <h4>📋 Submitted Proof:</h4>
                    {submission.video_link && (
                      <p><strong>Video:</strong> <a href={submission.video_link} target="_blank" rel="noopener noreferrer">🎥 Watch Video</a></p>
                    )}
                    {submission.images_link && (
                      <p><strong>Images:</strong> <a href={submission.images_link} target="_blank" rel="noopener noreferrer">🖼️ View Images</a></p>
                    )}
                    {submission.notes && (
                      <p><strong>Notes:</strong> {submission.notes}</p>
                    )}
                  </div>
                )}
                
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
                      onClick={() => openSubmissionModal(step, index)}
                      className="submit-proof-btn"
                    >
                      📸 {submission ? 'Update' : 'Submit'} Proof
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="modal-overlay" onClick={() => setShowSubmissionModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>📸 Submit Step Proof - Step {currentStep.step}</h3>
            <p className="modal-subtitle">{currentStep.title}</p>
            
            <div className="modal-form">
              <div className="form-group">
                <label>Video Link (YouTube/Vimeo)</label>
                <input
                  type="url"
                  value={submissionForm.video_link}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, video_link: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="form-group">
                <label>Images Link (Google Drive) *</label>
                <input
                  type="url"
                  value={submissionForm.images_link}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, images_link: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  required
                />
                <div className="upload-help">
                  <p><strong>📚 How to upload images:</strong></p>
                  <ol>
                    <li>Go to <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">drive.google.com</a></li>
                    <li>Create folder: "Step {currentStep.step} - {currentStep.title}"</li>
                    <li>Upload all photos/screenshots</li>
                    <li>Right-click folder → Share → "Anyone with link can view"</li>
                    <li>Copy link and paste above</li>
                  </ol>
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={submissionForm.notes}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, notes: e.target.value })}
                  placeholder="Add any notes about this step, challenges faced, or learnings..."
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowSubmissionModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button 
                onClick={submitStepProof} 
                className="submit-btn"
                disabled={!submissionForm.images_link}
              >
                ✅ Submit & Mark as Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;