module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    strava_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    name: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    profile_picture: DataTypes.TEXT, // URL from Strava
    badge_type_id: DataTypes.INTEGER, // Strava badge (0=none, 1=summit, 2=premium)
    access_token: DataTypes.TEXT("long"),
    refresh_token: DataTypes.TEXT("long"),
  });

  User.associate = (models) => {
    User.hasMany(models.Activity, { foreignKey: "user_id" });
  };

  return User;
};
