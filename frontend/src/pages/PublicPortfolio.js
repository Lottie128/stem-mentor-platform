import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/PublicPortfolio.css';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, [username]);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`/api/portfolio/${username}`);
      setPortfolio(response.data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="portfolio-loading">Loading portfolio...</div>;
  if (!portfolio) return <div className="portfolio-error">Portfolio not found</div>;

  return (
    <div className="public-portfolio">
      {/* Hero Section */}
      <div className="portfolio-hero glass-card">
        <div className="hero-content">
          {portfolio.student.profile_picture && (
            <img src={portfolio.student.profile_picture} alt={portfolio.student.full_name} className="profile-avatar" />
          )}
          <h1>{portfolio.student.full_name}</h1>
          {portfolio.student.bio && <p className="bio">{portfolio.student.bio}</p>}
          <div className="student-meta">
            {portfolio.student.school && <span>🏫 {portfolio.student.school}</span>}
            {portfolio.student.age && <span>👤 Age {portfolio.student.age}</span>}
            {portfolio.student.country && <span>🌍 {portfolio.student.country}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="portfolio-stats">
        <div className="stat-box glass-card">
          <div className="stat-value">{portfolio.projects.length}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-box glass-card">
          <div className="stat-value">{portfolio.certificates.length}</div>
          <div className="stat-label">Certificates</div>
        </div>
        <div className="stat-box glass-card">
          <div className="stat-value">{portfolio.achievements.length}</div>
          <div className="stat-label">Achievements</div>
        </div>
      </div>

      {/* Projects */}
      {portfolio.projects.length > 0 && (
        <div className="portfolio-section glass-card">
          <h2>🚀 Projects</h2>
          <div className="projects-grid">
            {portfolio.projects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p className="project-type">{project.type}</p>
                <p className="project-purpose">{project.purpose}</p>
                <div className="project-meta">
                  <span>📅 {new Date(project.created_at).toLocaleDateString()}</span>
                  <span className={`status ${project.status.toLowerCase()}`}>
                    {project.status === 'COMPLETED' ? '✅ Completed' : '🔵 In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {portfolio.certificates.length > 0 && (
        <div className="portfolio-section glass-card">
          <h2>🏆 Certificates</h2>
          <div className="certificates-grid">
            {portfolio.certificates.map(cert => (
              <a 
                key={cert.id} 
                href={`/certificate/${cert.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="certificate-card"
              >
                <div className="cert-icon">🎓</div>
                <h4>{cert.certificate_type.replace('_', ' ')}</h4>
                <p>{cert.certificate_number}</p>
                <p className="cert-date">{new Date(cert.issue_date).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {portfolio.achievements.length > 0 && (
        <div className="portfolio-section glass-card">
          <h2>🏅 Achievements</h2>
          <div className="achievements-grid">
            {portfolio.achievements.map(achievement => (
              <div key={achievement.id} className="achievement-card">
                <div className="achievement-icon">{achievement.icon || '🏆'}</div>
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                <p className="achievement-date">{new Date(achievement.date_earned).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicPortfolio;