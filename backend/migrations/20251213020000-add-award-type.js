'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('awards', 'award_type', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Unique type identifier for the award (e.g., FIRST_PROJECT, FIVE_PROJECTS)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('awards', 'award_type');
  }
};