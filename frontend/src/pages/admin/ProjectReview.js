import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchProject = useCallback(async () => {
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
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const generateAIPlan = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`/api/admin/projects/${projectId}/generate-plan`);
      setAiPlan(response.data.plan);
      setEditingPlan(true);
      alert('✅ AI plan generated successfully!');
    } catch (error) {
      alert('❌ Failed to generate AI plan: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const regenerateAIPlan = async () => {
    if (!window.confirm('🔄 Regenerate AI plan? This will replace the current plan.')) return;
    setGenerating(true);
    try {
      const response = await axios.post(`/api/admin/projects/${projectId}/generate-plan`);
      setAiPlan(response.data.plan);
      setEditingPlan(true);
      alert('✅ AI plan regenerated successfully!');
    } catch (error) {
      alert('❌ Failed to regenerate AI plan: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const approvePlan = async () => {
    try {
      // Send plan data in the format backend expects
      await axios.put(`/api/admin/projects/${projectId}/plan`, {
        components: aiPlan.components,
        steps: aiPlan.steps,
        safety_notes: aiPlan.safety_notes || ''
      });
      
      // Update project status
      await axios.patch(`/api/admin/projects/${projectId}/status`, {
        status: 'PLAN_READY'
      });
      
      alert('✅ Plan approved and published!');
      navigate('/admin');
    } catch (error) {
      console.error('Approve plan error:', error);
      alert('❌ Failed to approve plan: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="error">Project not found</div>;

  return (
    <div className="project-review">
      <div className="review-header">
        <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
        <h1>📋 Project Review</h1>
      </div>

      <div className="project-details-card glass-card">
        <h2>Project Information</h2>
        <div className="details-grid">
          <div className="detail-item">
            <label>Student:</label>
            <span>{project.student?.full_name || project.student_name}</span>
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
        <div className="generate-section glass-card">
          <h3>Generate Project Plan</h3>
          <p>Use AI to automatically generate a detailed project plan with components, steps, and safety notes.</p>
          <button onClick={generateAIPlan} disabled={generating} className="generate-btn">
            {generating ? '⏳ Generating AI Plan...' : '🤖 Generate Draft Plan with AI'}
          </button>
        </div>
      )}

      {aiPlan && (
        <div className="plan-editor glass-card">
          <div className="plan-header">
            <h2>Project Plan</h2>
            {editingPlan && <span className="editing-badge">✏️ Editing Mode</span>}
          </div>
          
          <div className="components-section">
            <h3>📦 Components Needed</h3>
            {editingPlan ? (
              <textarea
                value={JSON.stringify(aiPlan.components, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setAiPlan({...aiPlan, components: parsed});
                  } catch {}
                }}
                rows={10}
                className="json-editor"
              />
            ) : (
              <div className="components-list">
                {aiPlan.components?.map((comp, idx) => (
                  <div key={idx} className="component-item">
                    <strong>{comp.name}</strong> (Qty: {comp.quantity}) - {comp.estimated_cost}
                    <p>{comp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="steps-section">
            <h3>🔨 Build Steps</h3>
            {editingPlan ? (
              <textarea
                value={JSON.stringify(aiPlan.steps, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setAiPlan({...aiPlan, steps: parsed});
                  } catch {}
                }}
                rows={15}
                className="json-editor"
              />
            ) : (
              <div className="steps-list">
                {aiPlan.steps?.map((step, idx) => (
                  <div key={idx} className="step-item">
                    <div className="step-number">Step {step.step}</div>
                    <div className="step-content">
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                      <span className={`tag-badge ${step.tag}`}>{step.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="safety-section">
            <h3>⚠️ Safety Notes</h3>
            <textarea
              value={aiPlan.safety_notes || ''}
              onChange={(e) => setAiPlan({...aiPlan, safety_notes: e.target.value})}
              rows={5}
              placeholder="Add important safety considerations..."
              disabled={!editingPlan}
            />
          </div>

          <div className="plan-actions">
            <button onClick={regenerateAIPlan} disabled={generating} className="regenerate-btn">
              {generating ? '⏳ Regenerating...' : '🔄 Regenerate with AI'}
            </button>
            <button onClick={() => setEditingPlan(!editingPlan)} className="edit-btn">
              {editingPlan ? '🔒 Lock Plan' : '✏️ Edit Plan'}
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