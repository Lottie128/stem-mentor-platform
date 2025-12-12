const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  experience_level: {
    type: DataTypes.STRING,
    allowNull: false
  },
  available_tools: {
    type: DataTypes.TEXT
  },
  budget_range: {
    type: DataTypes.STRING
  },
  deadline: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('PENDING_REVIEW', 'PLAN_READY', 'IN_PROGRESS', 'COMPLETED'),
    defaultValue: 'PENDING_REVIEW'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether project is visible on public portfolio'
  }
}, {
  tableName: 'projects',
  underscored: true
});

module.exports = Project;