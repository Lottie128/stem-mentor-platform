const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

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
  awarded_by: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for system-generated awards
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

Award.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Award.belongsTo(User, { foreignKey: 'awarded_by', as: 'admin' });
User.hasMany(Award, { foreignKey: 'student_id', as: 'awards' });

module.exports = Award;