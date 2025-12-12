const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Project = require('./Project');

const IBRApplication = sequelize.define('IBRApplication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  google_drive_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'SUBMITTED',
      'REVIEWING',
      'DOCUMENTS_REQUIRED',
      'IN_PROGRESS',
      'APPROVED',
      'REJECTED'
    ),
    defaultValue: 'SUBMITTED'
  },
  progress_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  required_documents: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  applied_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  approved_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'ibr_applications',
  timestamps: true,
  underscored: true
});

IBRApplication.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
IBRApplication.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
User.hasMany(IBRApplication, { foreignKey: 'student_id', as: 'ibr_applications' });
Project.hasOne(IBRApplication, { foreignKey: 'project_id', as: 'ibr_application' });

module.exports = IBRApplication;