const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  social_links: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  theme_color: {
    type: DataTypes.STRING,
    defaultValue: '#667eea'
  }
}, {
  tableName: 'portfolios',
  timestamps: true,
  underscored: true
});

Portfolio.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
User.hasOne(Portfolio, { foreignKey: 'student_id', as: 'portfolio' });

module.exports = Portfolio;