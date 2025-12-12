const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Project = require('./Project');

const StepSubmission = sequelize.define('StepSubmission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  step_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  video_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  images_link: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Google Drive link to images folder'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'step_submissions',
  timestamps: true,
  underscored: true
});

StepSubmission.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasMany(StepSubmission, { foreignKey: 'project_id', as: 'step_submissions' });

module.exports = StepSubmission;