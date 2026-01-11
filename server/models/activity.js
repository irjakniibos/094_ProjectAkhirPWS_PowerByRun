module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define("activity", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    strava_activity_id: { type: DataTypes.BIGINT, unique: true },
    name: DataTypes.STRING,
    distance: DataTypes.FLOAT,
    moving_time: DataTypes.INTEGER,
    elapsed_time: DataTypes.INTEGER,
    average_speed: DataTypes.FLOAT,
    average_heartrate: DataTypes.FLOAT,
    max_heartrate: DataTypes.FLOAT,
    total_elevation_gain: DataTypes.FLOAT,
    average_cadence: DataTypes.FLOAT,
    calories: DataTypes.FLOAT,
    type: DataTypes.STRING,
    start_date: DataTypes.DATE,
    user_id: DataTypes.INTEGER,
  });

  Activity.associate = (models) => {
    Activity.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Activity;
};
