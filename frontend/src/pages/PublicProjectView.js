import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PublicProjectView.css';

const PublicProjectView = () => {
  const { username, projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [student, setStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [username, projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, submissionsRes] = await Promise.all([
        axios.get(`/api/portfolio/${username}/projects/${projectId}`),
        axios.get(`/api/submissions/project/${projectId}`)
      ]);
      
      setProject(projectRes.data.project);
      setStudent(projectRes.data.student);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForStep = (stepNumber) => {
    return submissions.find(s => s.step_number === stepNumber);
  };

  const getStepStatus = (step) => {
    const status = step.status || 'not_started';
    const icons = {
      not_started: '⚪',
      in_progress: '🔵',
      done: '✅'
    };
    return icons[status] || '⚪';
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="public-project-loading">
        <div className="spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project || !project.is_public) {
    return (
      <div className="public-project-error">
        <h2>🔒 Project Not Available</h2>
        <p>This project is either private or does not exist.</p>
        <button onClick={() => navigate(`/portfolio/${username}`)} className="back-btn">
          ← Back to Portfolio
        </button>
      </div>
    );
  }

  const completedSteps = project.plan?.steps.filter(s => s.status === 'done').length || 0;
  const totalSteps = project.plan?.steps.length || 0;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="public-project-view">
      {/* Hero Header */}
      <div className="project-hero">
        <button onClick={() => navigate(`/portfolio/${username}`)} className="back-btn">
          ← Back to Portfolio
        </button>
        <div className="hero-content">
          <div className="student-badge">
            {student?.profile_picture ? (
              <img src={student.profile_picture} alt={student.full_name} />
            ) : (
              <div className="avatar-placeholder">{student?.full_name?.[0]}</div>
            )}
            <div>
              <h3>{student?.full_name}</h3>
              <p>{student?.school}</p>
            </div>
          </div>
          <h1 className="project-title">{project.title}</h1>
          <div className="project-meta">
            <span className="meta-tag">📦 {project.type}</span>
            <span className="meta-tag">🎯 {project.experience_level}</span>
            {project.status === 'COMPLETED' && <span className="meta-tag completed">✅ Completed</span>}
          </div>
          {project.purpose && (
            <p className="project-purpose">{project.purpose}</p>
          )}
          <div className="progress-section">
            <div className="progress-info">
              <span>Build Progress</span>
              <span>{completedSteps}/{totalSteps} steps ({progressPercentage}%)</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Project Plan */}
      {project.plan && (
        <>
          {/* Safety Notes */}
          {project.plan.safety_notes && (
            <div className="section safety-section glass-card">
              <div className="section-header">
                <h2>⚠️ Safety First</h2>
              </div>
              <p className="safety-note">{project.plan.safety_notes}</p>
            </div>
          )}

          {/* Components Needed */}
          <div className="section components-section glass-card">
            <div className="section-header">
              <h2>📦 Components & Materials</h2>
            </div>
            <div className="components-grid">
              {project.plan.components.map((component, index) => (
                <div key={index} className="component-card">
                  <div className="component-header">
                    <h4>{component.name}</h4>
                    {component.estimated_cost && (
                      <span className="component-cost">{component.estimated_cost}</span>
                    )}
                  </div>
                  <p className="component-desc">{component.description}</p>
                  {component.quantity && (
                    <span className="component-qty">Qty: {component.quantity}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Build Journey / Steps */}
          <div className="section steps-section">
            <div className="section-header">
              <h2>🔨 Build Journey</h2>
              <p>Follow along as I built this project step by step</p>
            </div>

            <div className="build-timeline">
              {project.plan.steps.map((step, index) => {
                const submission = getSubmissionForStep(step.step);
                const isCompleted = step.status === 'done';
                const embedUrl = submission?.video_link ? getYouTubeEmbedUrl(submission.video_link) : null;
                
                return (
                  <div key={index} className={`timeline-item ${isCompleted ? 'completed' : ''}`}>
                    <div className="timeline-marker">
                      <span className="step-number">Step {step.step}</span>
                      <span className="step-status">{getStepStatus(step)}</span>
                    </div>
                    
                    <div className="timeline-content glass-card">
                      <div className="step-header">
                        <h3>{step.title}</h3>
                        <span className="step-tag">
                          {step.tag === 'center' ? '🏫 At Center' : '🏠 At Home'}
                        </span>
                      </div>
                      
                      <p className="step-description">{step.description}</p>
                      
                      {/* Show submission if completed */}
                      {isCompleted && submission && (
                        <div className="step-submission">
                          <h4>📋 What I Did:</h4>
                          
                          {/* YouTube Video Embed */}
                          {embedUrl && (
                            <div className="submission-video">
                              <h5>🎥 Video Documentation</h5>
                              <div className="video-container">
                                <iframe
                                  src={embedUrl}
                                  title={`Step ${step.step} Video`}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            </div>
                          )}
                          
                          {/* Images Link */}
                          {submission.images_link && (
                            <div className="submission-images">
                              <h5>🖼️ Photo Gallery</h5>
                              <a href={submission.images_link} target="_blank" rel="noopener noreferrer" className="images-link">
                                📸 View All Photos →
                              </a>
                            </div>
                          )}
                          
                          {/* Notes */}
                          {submission.notes && (
                            <div className="submission-notes">
                              <h5>📝 My Notes & Learnings:</h5>
                              <p>{submission.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!isCompleted && (
                        <div className="step-pending">
                          <p>⏳ This step is {step.status === 'in_progress' ? 'currently in progress' : 'not started yet'}...</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Share Footer */}
      <div className="share-footer glass-card">
        <div className="share-content">
          <h3>💡 Inspired by this project?</h3>
          <p>Check out more projects by {student?.full_name}</p>
          <button onClick={() => navigate(`/portfolio/${username}`)} className="view-portfolio-btn">
            View Full Portfolio →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicProjectView;