import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/IBRApplication.css';

const IBRApplication = () => {
  const navigate = useNavigate();
  const [completedProjects, setCompletedProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    category: '',
    description: '',
    google_drive_link: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, appsRes] = await Promise.all([
        axios.get('/api/student/projects'),
        axios.get('/api/ibr/my-applications')
      ]);

      const completed = projectsRes.data.filter(p => p.status === 'COMPLETED');
      const appliedProjectIds = appsRes.data.map(app => app.project_id);
      const availableProjects = completed.filter(p => !appliedProjectIds.includes(p.id));

      setCompletedProjects(availableProjects);
      setApplications(appsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/ibr/apply', formData);
      alert('IBR Application submitted successfully!');
      setShowForm(false);
      setFormData({ project_id: '', category: '', description: '', google_drive_link: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const uploadDocuments = async (appId, driveLink) => {
    try {
      await axios.put(`/api/ibr/applications/${appId}/documents`, {
        google_drive_link: driveLink
      });
      alert('Documents uploaded successfully!');
      fetchData();
    } catch (error) {
      alert('Failed to upload documents');
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'SUBMITTED': { color: '#3b82f6', icon: '📫', text: 'Submitted' },
      'REVIEWING': { color: '#f59e0b', icon: '🔍', text: 'Under Review' },
      'DOCUMENTS_REQUIRED': { color: '#ef4444', icon: '📄', text: 'Documents Required' },
      'IN_PROGRESS': { color: '#8b5cf6', icon: '⏳', text: 'In Progress' },
      'APPROVED': { color: '#22c55e', icon: '✅', text: 'Approved' },
      'REJECTED': { color: '#64748b', icon: '❌', text: 'Rejected' }
    };
    return statusMap[status] || statusMap['SUBMITTED'];
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="ibr-application-page">
      <div className="page-header glass-card">
        <button onClick={() => navigate('/student')} className="back-btn">← Back</button>
        <div>
          <h1 className="gradient-text">🇮🇳 India Book of Records</h1>
          <p>Apply for official recognition of your outstanding STEM projects</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions-card glass-card">
        <h2>📝 Application Process</h2>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Select Completed Project</h3>
              <p>Choose one of your completed projects to apply for IBR</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Submit Application</h3>
              <p>Fill in category, description, and upload project documentation to Google Drive</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Admin Review</h3>
              <p>Your mentor will review and submit to IBR on your behalf</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Track Progress</h3>
              <p>Monitor your application status and upload any required documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Projects */}
      {completedProjects.length > 0 && !showForm && (
        <div className="available-projects">
          <h2>✅ Eligible Projects ({completedProjects.length})</h2>
          <div className="projects-list">
            {completedProjects.map(project => (
              <div key={project.id} className="project-item glass-card">
                <div className="project-info">
                  <h3>{project.title}</h3>
                  <p className="project-type">{project.type}</p>
                </div>
                <button
                  onClick={() => {
                    setFormData({ ...formData, project_id: project.id });
                    setShowForm(true);
                  }}
                  className="apply-btn"
                >
                  Apply with this project →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Form */}
      {showForm && (
        <div className="application-form glass-card">
          <h2>📝 New IBR Application</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Youngest to build a drone, Most creative robot, etc."
                required
              />
            </div>

            <div className="form-group">
              <label>Project Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what makes your project unique and record-worthy..."
                rows={6}
                required
              />
            </div>

            <div className="form-group">
              <label>Google Drive Link (Build Documentation) *</label>
              <input
                type="url"
                value={formData.google_drive_link}
                onChange={(e) => setFormData({ ...formData, google_drive_link: e.target.value })}
                placeholder="https://drive.google.com/..."
                required
              />
              <div className="upload-instructions">
                <p><strong>📚 How to upload to Google Drive:</strong></p>
                <ol>
                  <li>Go to <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">drive.google.com</a></li>
                  <li>Create a new folder named "IBR - [Your Project Name]"</li>
                  <li>Upload all videos, photos, and build documentation</li>
                  <li>Right-click folder → Share → Change to "Anyone with the link can view"</li>
                  <li>Copy the link and paste it above</li>
                </ol>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Applications */}
      {applications.length > 0 && (
        <div className="my-applications">
          <h2>📋 My Applications ({applications.length})</h2>
          <div className="applications-list">
            {applications.map(app => {
              const statusInfo = getStatusInfo(app.status);
              return (
                <div key={app.id} className="application-card glass-card">
                  <div className="app-header">
                    <div>
                      <h3>{app.project?.title}</h3>
                      <p className="app-category">{app.category}</p>
                    </div>
                    <div className="app-status" style={{ color: statusInfo.color }}>
                      {statusInfo.icon} {statusInfo.text}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-label">
                      <span>Progress</span>
                      <span>{app.progress_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${app.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  {app.admin_notes && (
                    <div className="admin-notes">
                      <strong>📝 Admin Notes:</strong>
                      <p>{app.admin_notes}</p>
                    </div>
                  )}

                  {app.status === 'DOCUMENTS_REQUIRED' && app.required_documents?.length > 0 && (
                    <div className="required-docs">
                      <strong>📄 Required Documents:</strong>
                      <ul>
                        {app.required_documents.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => {
                          const link = prompt('Paste Google Drive link with required documents:');
                          if (link) uploadDocuments(app.id, link);
                        }}
                        className="upload-docs-btn"
                      >
                        Upload Documents
                      </button>
                    </div>
                  )}

                  <div className="app-footer">
                    <span className="app-date">
                      Applied: {new Date(app.applied_date).toLocaleDateString()}
                    </span>
                    {app.approved_date && (
                      <span className="app-date">
                        Approved: {new Date(app.approved_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completedProjects.length === 0 && applications.length === 0 && (
        <div className="empty-state glass-card">
          <div className="empty-icon">🚧</div>
          <h3>No Eligible Projects Yet</h3>
          <p>Complete at least one project to apply for India Book of Records</p>
          <button onClick={() => navigate('/student')} className="back-dash-btn">
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default IBRApplication;