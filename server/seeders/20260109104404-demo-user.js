"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      {
        strava_id: 12345678,
        name: "Demo User",
        city: "Jakarta",
        country: "Indonesia",
        access_token: "demo_access_token",
        refresh_token: "demo_refresh_token",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", { strava_id: 12345678 }, {});
  },
};
