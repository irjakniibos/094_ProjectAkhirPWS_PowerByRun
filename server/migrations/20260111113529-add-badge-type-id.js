'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'badge_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Strava badge type ID (0=none, 1=summit, 2=premium)',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'badge_type_id');
  }
};
