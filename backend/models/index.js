const { sequelize } = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const ProjectPlan = require('./ProjectPlan');
const Certificate = require('./Certificate');
const Award = require('./Award');

// Define all associations here to avoid duplicates
Project.belongsTo(User, { as: 'student', foreignKey: 'student_id' });
User.hasMany(Project, { as: 'projects', foreignKey: 'student_id' });

Project.hasOne(ProjectPlan, { as: 'plan', foreignKey: 'project_id' });
ProjectPlan.belongsTo(Project, { as: 'project', foreignKey: 'project_id' });

ProjectPlan.belongsTo(User, { as: 'admin', foreignKey: 'finalized_by_admin_id' });

Certificate.belongsTo(User, { as: 'student', foreignKey: 'student_id' });
Certificate.belongsTo(Project, { as: 'project', foreignKey: 'project_id' });
User.hasMany(Certificate, { as: 'certificates', foreignKey: 'student_id' });
Project.hasMany(Certificate, { as: 'certificates', foreignKey: 'project_id' });

Award.belongsTo(User, { as: 'student', foreignKey: 'student_id' });
User.hasMany(Award, { as: 'awards', foreignKey: 'student_id' });

module.exports = {
  sequelize,
  User,
  Project,
  ProjectPlan,
  Certificate,
  Award
};