import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ProjectSubmit.css';

const ProjectSubmit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: 'Robot',
    purpose: 'School project',
    experience_level: 'Beginner',
    available_tools: '',
    budget_range: 'Under ₹1000',
    deadline: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/student/projects', formData);
      alert('Project submitted successfully! Your mentor will review it soon.');
      navigate('/student');
    } catch (error) {
      alert('Failed to submit project: ' + (error.response?.data?.message || 'Unknown error'));
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="project-submit">
      <div className="submit-header">
        <button onClick={() => navigate('/student')} className="back-btn">← Back</button>
        <h1>Submit Your Project Idea</h1>
        <p>Tell us about what you want to build, and we'll help you create a safe, realistic plan!</p>
      </div>

      <form onSubmit={handleSubmit} className="submit-form">
        <div className="form-group">
          <label htmlFor="title">What do you want to build? *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Line-following robot, Weather station, Mobile app..."
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Project Type *</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} required>
              <option value="Robot">Robot</option>
              <option value="Humanoid">Humanoid</option>
              <option value="IoT">IoT Device</option>
              <option value="App">Mobile/Web App</option>
              <option value="Game">Game</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose *</label>
            <select id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} required>
              <option value="School project">School Project</option>
              <option value="Competition">Competition</option>
              <option value="Hobby">Personal Hobby</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="experience_level">Your Experience Level *</label>
            <select id="experience_level" name="experience_level" value={formData.experience_level} onChange={handleChange} required>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="budget_range">Budget Range *</label>
            <select id="budget_range" name="budget_range" value={formData.budget_range} onChange={handleChange} required>
              <option value="Under ₹1000">Under ₹1000</option>
              <option value="₹1000-₹3000">₹1000 - ₹3000</option>
              <option value="₹3000+">₹3000+</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="available_tools">Tools/Equipment You Have Access To</label>
          <textarea
            id="available_tools"
            name="available_tools"
            value={formData.available_tools}
            onChange={handleChange}
            placeholder="e.g., Soldering iron, 3D printer, basic electronics kit, Arduino..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Target Completion Date (Optional)</label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/student')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Submitting...' : 'Submit Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectSubmit;