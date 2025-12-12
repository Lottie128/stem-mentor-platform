const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Submission = sequelize.define('Submission', {
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
    type: DataTypes.TEXT,
    allowNull: true
  },
  images_link: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'submissions',
  underscored: true
});

module.exports = Submission;