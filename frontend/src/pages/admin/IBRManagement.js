import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/IBRManagement.css';

const IBRManagement = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/admin/ibr-applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch IBR applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      await axios.patch(`/api/admin/ibr-applications/${id}`, { status });
      alert(`✅ Application ${status.toLowerCase()}`);
      fetchApplications();
    } catch (error) {
      alert('❌ Failed to update application status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { className: 'badge-warning', text: 'Pending Review', icon: '⏳' },
      APPROVED: { className: 'badge-success', text: 'Approved', icon: '✅' },
      REJECTED: { className: 'badge-danger', text: 'Rejected', icon: '❌' },
      SUBMITTED: { className: 'badge-info', text: 'Submitted to IBR', icon: '📤' }
    };
    return badges[status] || badges.PENDING;
  };

  const filteredApplications = filter === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === filter);

  if (loading) return <div className="loading">Loading IBR applications...</div>;

  return (
    <div className="ibr-management">
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
        <div className="header-content">
          <h1>🇮🇳 India Book of Records Applications</h1>
          <p>Review and manage student applications for IBR certification</p>
        </div>
      </div>

      <div className="filters glass-card">
        <button 
          onClick={() => setFilter('ALL')} 
          className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
        >
          All ({applications.length})
        </button>
        <button 
          onClick={() => setFilter('PENDING')} 
          className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
        >
          ⏳ Pending ({applications.filter(a => a.status === 'PENDING').length})
        </button>
        <button 
          onClick={() => setFilter('APPROVED')} 
          className={`filter-btn ${filter === 'APPROVED' ? 'active' : ''}`}
        >
          ✅ Approved ({applications.filter(a => a.status === 'APPROVED').length})
        </button>
        <button 
          onClick={() => setFilter('SUBMITTED')} 
          className={`filter-btn ${filter === 'SUBMITTED' ? 'active' : ''}`}
        >
          📤 Submitted ({applications.filter(a => a.status === 'SUBMITTED').length})
        </button>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="empty-state glass-card">
          <div className="empty-icon">📋</div>
          <h3>No Applications Found</h3>
          <p>No IBR applications match the selected filter.</p>
        </div>
      ) : (
        <div className="applications-list">
          {filteredApplications.map(app => {
            const badge = getStatusBadge(app.status);
            return (
              <div key={app.id} className="application-card glass-card">
                <div className="card-header">
                  <div className="student-info">
                    <h3>{app.student_name}</h3>
                    <p className="student-meta">
                      📧 {app.student_email} | 🏫 {app.student_school}
                    </p>
                  </div>
                  <span className={`status-badge ${badge.className}`}>
                    {badge.icon} {badge.text}
                  </span>
                </div>

                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Category:</label>
                      <span>{app.category}</span>
                    </div>
                    <div className="info-item">
                      <label>Projects Completed:</label>
                      <span>{app.projects_completed || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Applied:</label>
                      <span>{new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {app.achievement_description && (
                    <div className="achievement-section">
                      <h4>Achievement Description:</h4>
                      <p>{app.achievement_description}</p>
                    </div>
                  )}

                  {app.supporting_links && (
                    <div className="links-section">
                      <h4>Supporting Links:</h4>
                      <p><a href={app.supporting_links} target="_blank" rel="noopener noreferrer">🔗 View Links</a></p>
                    </div>
                  )}
                </div>

                {app.status === 'PENDING' && (
                  <div className="card-actions">
                    <button 
                      onClick={() => updateApplicationStatus(app.id, 'APPROVED')}
                      className="approve-btn"
                    >
                      ✅ Approve
                    </button>
                    <button 
                      onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                      className="reject-btn"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                {app.status === 'APPROVED' && (
                  <div className="card-actions">
                    <button 
                      onClick={() => updateApplicationStatus(app.id, 'SUBMITTED')}
                      className="submit-btn"
                    >
                      📤 Mark as Submitted to IBR
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IBRManagement;