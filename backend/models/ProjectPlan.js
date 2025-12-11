const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Project = require('./Project');
const User = require('./User');

const ProjectPlan = sequelize.define('ProjectPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  components: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  safety_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  generated_by_ai: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  finalized_by_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'project_plans',
  timestamps: true,
  underscored: true
});

// Associations
ProjectPlan.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasOne(ProjectPlan, { foreignKey: 'project_id', as: 'plan' });

ProjectPlan.belongsTo(User, { foreignKey: 'finalized_by_admin_id', as: 'admin' });

module.exports = ProjectPlan;