import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PublicPortfolio.css';

const PublicPortfolio = () => {
  const { username } = useParams();
  const navigate = useNavigate();
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

  // Helper to parse skills safely
  const getSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        return Array.isArray(parsed) ? parsed : skills.split(',').map(s => s.trim());
      } catch {
        return skills.split(',').map(s => s.trim());
      }
    }
    return [];
  };

  // Helper to parse social links safely
  const getSocialLinks = (links) => {
    if (!links) return [];
    if (Array.isArray(links)) return links;
    if (typeof links === 'string') {
      try {
        const parsed = JSON.parse(links);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (typeof links === 'object') {
      return Object.entries(links)
        .filter(([key, value]) => value)
        .map(([platform, username]) => ({
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          url: getSocialUrl(platform, username)
        }));
    }
    return [];
  };

  const getSocialUrl = (platform, username) => {
    const urls = {
      github: `https://github.com/${username}`,
      linkedin: `https://linkedin.com/in/${username}`,
      twitter: `https://twitter.com/${username}`
    };
    return urls[platform.toLowerCase()] || username;
  };

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="spinner"></div>
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="portfolio-error">
        <h2>🔍 Portfolio Not Found</h2>
        <p>The requested portfolio does not exist.</p>
      </div>
    );
  }

  const { student, projects, certificates, awards } = portfolio;
  const skills = getSkills(student.skills);
  const socialLinks = getSocialLinks(student.social_links);

  return (
    <div className="public-portfolio">
      {/* Hero Section */}
      <div className="portfolio-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="profile-section">
            {student.profile_picture ? (
              <img src={student.profile_picture} alt={student.full_name} className="profile-image" />
            ) : (
              <div className="profile-placeholder">{student.full_name?.[0]}</div>
            )}
            <div className="profile-info">
              <h1>{student.full_name}</h1>
              <p className="school">🏫 {student.school || 'STEM Enthusiast'}</p>
              <p className="location">🌍 {student.country || 'Location not specified'}</p>
              {student.bio && <p className="bio">{student.bio}</p>}
              {skills.length > 0 && (
                <div className="skills">
                  {skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="portfolio-stats">
        <div className="stat-box glass-card">
          <div className="stat-icon">📦</div>
          <div className="stat-number">{projects.length}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-box glass-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-number">{awards.length}</div>
          <div className="stat-label">Awards</div>
        </div>
        <div className="stat-box glass-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-number">{certificates.length}</div>
          <div className="stat-label">Certificates</div>
        </div>
      </div>

      {/* Projects Section */}
      {projects.length > 0 && (
        <div className="portfolio-section">
          <h2 className="section-title">📦 My STEM Projects</h2>
          <div className="projects-grid">
            {projects.map(project => {
              const completedSteps = project.plan?.steps.filter(s => s.status === 'done').length || 0;
              const totalSteps = project.plan?.steps.length || 0;
              const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
              
              return (
                <div 
                  key={project.id} 
                  className="project-card glass-card"
                  onClick={() => navigate(`/portfolio/${username}/project/${project.id}`)}
                >
                  <div className="project-header">
                    <span className="project-type">{project.type}</span>
                    {project.status === 'COMPLETED' && <span className="completed-badge">✅</span>}
                  </div>
                  <h3>{project.title}</h3>
                  <p className="project-purpose">{project.purpose}</p>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="progress-text">{progress}% Complete</span>
                  </div>
                  <button className="view-project-btn">View Build Journey →</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Awards Section */}
      {awards.length > 0 && (
        <div className="portfolio-section">
          <h2 className="section-title">🏆 Achievements & Awards</h2>
          <div className="awards-grid">
            {awards.map(award => (
              <div key={award.id} className="award-card glass-card">
                <div className="award-icon">{award.icon}</div>
                <h4>{award.title}</h4>
                <p>{award.description}</p>
                <span className="award-date">{new Date(award.awarded_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="portfolio-section">
          <h2 className="section-title">🎓 Certifications</h2>
          <div className="certificates-grid">
            {certificates.map(cert => (
              <a 
                key={cert.id} 
                href={`/certificate/${cert.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="certificate-card glass-card"
              >
                <div className="cert-header">
                  <div className="cert-icon">🏆</div>
                  <span className="cert-type">{cert.certificate_type.replace('_', ' ')}</span>
                </div>
                <h4>{cert.project?.title || 'STEM Certificate'}</h4>
                <p className="cert-number">{cert.certificate_number}</p>
                <p className="cert-date">Issued: {new Date(cert.issue_date).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="portfolio-footer">
        <p>💡 Built with passion for STEM education</p>
        {socialLinks.length > 0 && (
          <div className="social-links">
            {socialLinks.map((link, index) => (
              <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="social-link">
                {link.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPortfolio;