const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

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
    type: DataTypes.ENUM('Robot', 'Humanoid', 'IoT', 'App', 'Game', 'Other'),
    allowNull: false
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experience_level: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
    allowNull: false
  },
  available_tools: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  budget_range: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING_REVIEW', 'PLAN_READY', 'IN_PROGRESS', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'PENDING_REVIEW'
  }
}, {
  tableName: 'projects',
  timestamps: true,
  underscored: true
});

// Associations
Project.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
User.hasMany(Project, { foreignKey: 'student_id', as: 'projects' });

module.exports = Project;