const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Achievement = sequelize.define('Achievement', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '🏆'
  },
  date_earned: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  achievement_type: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., FIRST_PROJECT, TEN_PROJECTS, IBR_CERTIFIED'
  }
}, {
  tableName: 'achievements',
  underscored: true
});

module.exports = Achievement;