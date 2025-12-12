'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add skills and social_links to users
    await queryInterface.addColumn('users', 'skills', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: []
    });
    
    await queryInterface.addColumn('users', 'social_links', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    });
    
    // Add is_public to projects
    await queryInterface.addColumn('projects', 'is_public', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Whether project is visible on public portfolio'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'skills');
    await queryInterface.removeColumn('users', 'social_links');
    await queryInterface.removeColumn('projects', 'is_public');
  }
};