'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'age', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'school', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'India'
    });
    
    await queryInterface.addColumn('users', 'profile_picture', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'age');
    await queryInterface.removeColumn('users', 'school');
    await queryInterface.removeColumn('users', 'country');
    await queryInterface.removeColumn('users', 'profile_picture');
    await queryInterface.removeColumn('users', 'bio');
  }
};
