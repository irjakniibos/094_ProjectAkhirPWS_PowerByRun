module.exports = (sequelize, DataTypes) => {
    const ActivitySplit = sequelize.define("activity_split", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        activity_id: { type: DataTypes.INTEGER, allowNull: false },
        split_number: DataTypes.INTEGER,
        distance: DataTypes.FLOAT,
        elapsed_time: DataTypes.INTEGER,
        moving_time: DataTypes.INTEGER,
        average_speed: DataTypes.FLOAT,
        pace_seconds: DataTypes.INTEGER, // pace in seconds per km
        elevation_difference: DataTypes.FLOAT,
        average_heartrate: DataTypes.FLOAT,
    });

    ActivitySplit.associate = (models) => {
        ActivitySplit.belongsTo(models.Activity, { foreignKey: "activity_id" });
    };

    return ActivitySplit;
};
