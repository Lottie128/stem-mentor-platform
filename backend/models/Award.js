const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Award = sequelize.define('Award', {
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
    allowNull: false,
    defaultValue: '🏆'
  },
  award_type: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Unique type identifier for the award (e.g., FIRST_PROJECT, FIVE_PROJECTS)'
  },
  awarded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  awarded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'awards',
  timestamps: true,
  underscored: true
});

module.exports = Award;