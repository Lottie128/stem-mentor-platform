import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Awards.css';

const Awards = () => {
  const navigate = useNavigate();
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const response = await axios.get('/api/awards/me');
      setAwards(response.data);
    } catch (error) {
      console.error('Failed to fetch awards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading awards...</div>;

  return (
    <div className="awards-page">
      <div className="page-header glass-card">
        <button onClick={() => navigate('/student')} className="back-btn">← Back</button>
        <div>
          <h1 className="gradient-text">🏆 My Awards & Achievements</h1>
          <p>Recognition for your hard work and outstanding achievements</p>
        </div>
      </div>

      {awards.length === 0 ? (
        <div className="empty-awards glass-card">
          <div className="empty-icon">🎖️</div>
          <h2>No Awards Yet</h2>
          <p>Keep working on your projects and your mentor will recognize your achievements!</p>
          <button onClick={() => navigate('/student')} className="back-dash-btn">
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="awards-grid">
          {awards.map(award => (
            <div key={award.id} className="award-card glass-card">
              <div className="award-icon-large">{award.icon}</div>
              <h3>{award.title}</h3>
              <p>{award.description}</p>
              <div className="award-footer">
                <div className="awarded-info">
                  <span className="awarded-by">👨‍🏫 {award.admin?.full_name || 'Mentor'}</span>
                  <span className="awarded-date">📅 {new Date(award.awarded_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Awards;