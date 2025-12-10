import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ProjectReview.css';

const ProjectReview = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [editingPlan, setEditingPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/admin/projects/${projectId}`);
      setProject(response.data);
      if (response.data.plan) {
        setAiPlan(response.data.plan);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIPlan = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`/api/admin/projects/${projectId}/generate-plan`);
      setAiPlan(response.data.plan);
      setEditingPlan(true);
    } catch (error) {
      alert('Failed to generate AI plan: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const approvePlan = async () => {
    try {
      await axios.put(`/api/admin/projects/${projectId}/plan`, {
        plan: aiPlan,
        status: 'PLAN_READY'
      });
      alert('Plan approved and published!');
      navigate('/admin');
    } catch (error) {
      alert('Failed to approve plan');
    }
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="error">Project not found</div>;

  return (
    <div className="project-review">
      <div className="review-header">
        <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
        <h1>Project Review</h1>
      </div>

      <div className="project-details-card">
        <h2>Project Information</h2>
        <div className="details-grid">
          <div className="detail-item">
            <label>Student:</label>
            <span>{project.student_name}</span>
          </div>
          <div className="detail-item">
            <label>Title:</label>
            <span>{project.title}</span>
          </div>
          <div className="detail-item">
            <label>Type:</label>
            <span className="type-badge">{project.type}</span>
          </div>
          <div className="detail-item">
            <label>Purpose:</label>
            <span>{project.purpose}</span>
          </div>
          <div className="detail-item">
            <label>Experience:</label>
            <span>{project.experience_level}</span>
          </div>
          <div className="detail-item">
            <label>Budget:</label>
            <span>{project.budget_range}</span>
          </div>
          <div className="detail-item">
            <label>Tools Available:</label>
            <span>{project.available_tools || 'None specified'}</span>
          </div>
          <div className="detail-item">
            <label>Deadline:</label>
            <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}</span>
          </div>
        </div>
      </div>

      {!aiPlan && (
        <div className="generate-section">
          <button onClick={generateAIPlan} disabled={generating} className="generate-btn">
            {generating ? 'Generating AI Plan...' : '🤖 Generate Draft Plan with AI'}
          </button>
        </div>
      )}

      {aiPlan && (
        <div className="plan-editor">
          <h2>Project Plan {editingPlan && <span className="editing-badge">Editing</span>}</h2>
          
          <div className="components-section">
            <h3>Components Needed</h3>
            <textarea
              value={JSON.stringify(aiPlan.components, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setAiPlan({...aiPlan, components: parsed});
                } catch {}
              }}
              rows={10}
            />
          </div>

          <div className="steps-section">
            <h3>Build Steps</h3>
            <textarea
              value={JSON.stringify(aiPlan.steps, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setAiPlan({...aiPlan, steps: parsed});
                } catch {}
              }}
              rows={15}
            />
          </div>

          <div className="safety-section">
            <h3>Safety Notes</h3>
            <textarea
              value={aiPlan.safety_notes || ''}
              onChange={(e) => setAiPlan({...aiPlan, safety_notes: e.target.value})}
              rows={5}
              placeholder="Add important safety considerations..."
            />
          </div>

          <div className="plan-actions">
            <button onClick={() => setEditingPlan(!editingPlan)} className="edit-btn">
              {editingPlan ? 'Stop Editing' : 'Edit Plan'}
            </button>
            <button onClick={approvePlan} className="approve-btn">
              ✅ Approve & Publish Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectReview;