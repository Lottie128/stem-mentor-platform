// Central model registry
const User = require('./User');
const Project = require('./Project');
const ProjectPlan = require('./ProjectPlan');
const Award = require('./Award');
const Portfolio = require('./Portfolio');
const StepSubmission = require('./StepSubmission');
const IBRApplication = require('./IBRApplication');
const Certificate = require('./Certificate');

// Export all models
module.exports = {
  User,
  Project,
  ProjectPlan,
  Award,
  Portfolio,
  StepSubmission,
  IBRApplication,
  Certificate
};