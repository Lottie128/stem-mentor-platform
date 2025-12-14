import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/IBRManagement.css';

const IBRManagement = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [requiredDocs, setRequiredDocs] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/ibr/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      alert('❌ Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await axios.put(`/api/ibr/applications/${appId}/status`, { status });
      alert(`✅ Status updated to ${status}`);
      fetchApplications();
      if (selectedApp?.id === appId) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (error) {
      alert('❌ Failed to update status');
    }
  };

  const updateProgress = async (appId, progress) => {
    try {
      await axios.put(`/api/ibr/applications/${appId}/progress`, { 
        progress_percentage: parseInt(progress) 
      });
      fetchApplications();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const saveNotes = async () => {
    if (!selectedApp) return;
    
    try {
      await axios.put(`/api/ibr/applications/${selectedApp.id}/status`, {
        status: selectedApp.status,
        admin_notes: notes || null,
        required_documents: requiredDocs // Will be converted to array in backend
      });
      alert('✅ Notes saved successfully');
      setEditingNotes(false);
      fetchApplications();
      
      // Update selected app
      const docsArray = requiredDocs.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      setSelectedApp({ 
        ...selectedApp, 
        admin_notes: notes,
        required_documents: docsArray
      });
    } catch (error) {
      console.error('Save notes error:', error);
      alert('❌ Failed to save notes');
    }
  };

  const openNotesEditor = (app) => {
    setSelectedApp(app);
    setNotes(app.admin_notes || '');
    
    // Convert array to string for textarea
    if (Array.isArray(app.required_documents) && app.required_documents.length > 0) {
      setRequiredDocs(app.required_documents.join('\n'));
    } else {
      setRequiredDocs('');
    }
    
    setEditingNotes(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'SUBMITTED': '#3b82f6',
      'REVIEWING': '#f59e0b',
      'DOCUMENTS_REQUIRED': '#ef4444',
      'IN_PROGRESS': '#8b5cf6',
      'APPROVED': '#10b981',
      'REJECTED': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'SUBMITTED': '📨',
      'REVIEWING': '🔍',
      'DOCUMENTS_REQUIRED': '📄',
      'IN_PROGRESS': '⚙️',
      'APPROVED': '✅',
      'REJECTED': '❌'
    };
    return icons[status] || '📋';
  };

  const filteredApps = applications.filter(app => 
    filter === 'ALL' || app.status === filter
  );

  const statusCounts = {
    ALL: applications.length,
    SUBMITTED: applications.filter(a => a.status === 'SUBMITTED').length,
    REVIEWING: applications.filter(a => a.status === 'REVIEWING').length,
    DOCUMENTS_REQUIRED: applications.filter(a => a.status === 'DOCUMENTS_REQUIRED').length,
    IN_PROGRESS: applications.filter(a => a.status === 'IN_PROGRESS').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length
  };

  if (loading) return <div className="loading">Loading IBR applications...</div>;

  return (
    <div className="ibr-management">
      <div className="ibr-header">
        <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
        <h1>🇮🇳 IBR Application Management</h1>
        <p className="subtitle">Manage Invention-Based Research applications and track progress</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {Object.keys(statusCounts).map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'ALL' ? '📊 All' : `${getStatusIcon(status)} ${status.replace('_', ' ')}`}
            <span className="count-badge">{statusCounts[status]}</span>
          </button>
        ))}
      </div>

      {/* Applications Grid */}
      <div className="applications-grid">
        {filteredApps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No applications found</h3>
            <p>No IBR applications matching the selected filter</p>
          </div>
        ) : (
          filteredApps.map(app => (
            <div key={app.id} className="application-card glass-card">
              {/* Header */}
              <div className="app-card-header">
                <div className="app-title">
                  <h3>{app.project?.title || 'Project'}</h3>
                  <span className="project-type">{app.project?.type}</span>
                </div>
                <div 
                  className="status-badge"
                  style={{ background: getStatusColor(app.status) + '20', 
                           color: getStatusColor(app.status),
                           border: `1px solid ${getStatusColor(app.status)}50` }}
                >
                  {getStatusIcon(app.status)} {app.status.replace('_', ' ')}
                </div>
              </div>

              {/* Student Info */}
              <div className="app-student-info">
                <div className="info-row">
                  <span className="label">👤 Student:</span>
                  <span className="value">{app.student?.full_name}</span>
                </div>
                <div className="info-row">
                  <span className="label">📧 Email:</span>
                  <span className="value">{app.student?.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">🗂️ Category:</span>
                  <span className="value">{app.category}</span>
                </div>
                <div className="info-row">
                  <span className="label">📅 Applied:</span>
                  <span className="value">{new Date(app.applied_date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-value">{app.progress_percentage}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      width: `${app.progress_percentage}%`,
                      background: getStatusColor(app.status)
                    }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={app.progress_percentage}
                  onChange={(e) => updateProgress(app.id, e.target.value)}
                  className="progress-slider"
                />
              </div>

              {/* Description */}
              {app.description && (
                <div className="app-description">
                  <strong>📝 Description:</strong>
                  <p>{app.description}</p>
                </div>
              )}

              {/* Admin Notes Preview */}
              {app.admin_notes && (
                <div className="notes-preview">
                  <strong>📌 Admin Notes:</strong>
                  <p>{app.admin_notes.substring(0, 100)}{app.admin_notes.length > 100 ? '...' : ''}</p>
                </div>
              )}

              {/* Required Documents */}
              {Array.isArray(app.required_documents) && app.required_documents.length > 0 && (
                <div className="required-docs">
                  <strong>📄 Required Documents:</strong>
                  <ul>
                    {app.required_documents.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="app-actions">
                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app.id, e.target.value)}
                  className="status-select"
                >
                  <option value="SUBMITTED">📨 Submitted</option>
                  <option value="REVIEWING">🔍 Reviewing</option>
                  <option value="DOCUMENTS_REQUIRED">📄 Docs Required</option>
                  <option value="IN_PROGRESS">⚙️ In Progress</option>
                  <option value="APPROVED">✅ Approved</option>
                  <option value="REJECTED">❌ Rejected</option>
                </select>

                <button 
                  onClick={() => openNotesEditor(app)} 
                  className="notes-btn"
                >
                  ✏️ Manage Notes
                </button>

                {app.google_drive_link && (
                  <a 
                    href={app.google_drive_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="drive-btn"
                  >
                    📁 View Files
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notes Editor Modal */}
      {editingNotes && selectedApp && (
        <div className="modal-overlay" onClick={() => setEditingNotes(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Manage Application Notes</h2>
              <button onClick={() => setEditingNotes(false)} className="close-btn">✕</button>
            </div>

            <div className="modal-body">
              <div className="app-info-summary">
                <h3>{selectedApp.project?.title}</h3>
                <p>Student: {selectedApp.student?.full_name}</p>
                <p>Status: <span style={{ color: getStatusColor(selectedApp.status) }}>
                  {selectedApp.status}
                </span></p>
              </div>

              <div className="form-group">
                <label>📌 Admin Notes (visible to student)</label>
                <p className="helper-text">Provide feedback, updates, or next steps for the student</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  placeholder="Enter notes for the student...\n\nExample:\n- Your application is under review\n- Great work on the project documentation!\n- Next step: Interview scheduled for Dec 20th\n- Congratulations! Your application has been approved"
                  className="notes-textarea"
                />
              </div>

              <div className="form-group">
                <label>📄 Required Documents</label>
                <p className="helper-text">List any documents the student needs to submit (one per line)</p>
                <textarea
                  value={requiredDocs}
                  onChange={(e) => setRequiredDocs(e.target.value)}
                  rows={6}
                  placeholder="List required documents (one per line)...\n\nExample:\nProject report (PDF)\nPresentation slides (PPT)\nDemo video link\nBudget breakdown (Excel)\nTeacher recommendation letter"
                  className="notes-textarea"
                />
                {requiredDocs && (
                  <div className="docs-preview">
                    <strong>Preview:</strong>
                    <ul>
                      {requiredDocs.split('\n').filter(line => line.trim()).map((doc, idx) => (
                        <li key={idx}>{doc.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setEditingNotes(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={saveNotes} className="save-btn">
                💾 Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IBRManagement;