const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Certificate = sequelize.define('Certificate', {
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
  certificate_type: {
    type: DataTypes.ENUM('STEM_ORG', 'IBR', 'COMPLETION'),
    allowNull: false
  },
  certificate_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  issue_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  pdf_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verification_code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  tableName: 'certificates',
  timestamps: true,
  underscored: true
});

module.exports = Certificate;