"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("activities", "average_heartrate", {
            type: Sequelize.FLOAT,
            allowNull: true,
        });
        await queryInterface.addColumn("activities", "max_heartrate", {
            type: Sequelize.FLOAT,
            allowNull: true,
        });
        await queryInterface.addColumn("activities", "total_elevation_gain", {
            type: Sequelize.FLOAT,
            allowNull: true,
        });
        await queryInterface.addColumn("activities", "average_cadence", {
            type: Sequelize.FLOAT,
            allowNull: true,
        });
        await queryInterface.addColumn("activities", "calories", {
            type: Sequelize.FLOAT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("activities", "average_heartrate");
        await queryInterface.removeColumn("activities", "max_heartrate");
        await queryInterface.removeColumn("activities", "total_elevation_gain");
        await queryInterface.removeColumn("activities", "average_cadence");
        await queryInterface.removeColumn("activities", "calories");
    },
};
