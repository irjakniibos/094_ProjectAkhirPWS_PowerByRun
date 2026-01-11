const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const User = require("./user")(sequelize, DataTypes);
const Activity = require("./activity")(sequelize, DataTypes);
const ActivitySplit = require("./activitySplit")(sequelize, DataTypes);
const Admin = require("./admin")(sequelize, DataTypes);
const UserLog = require("./userLog")(sequelize, DataTypes);

// Associations
User.associate({ Activity });
Activity.associate({ User });
Activity.hasMany(ActivitySplit, { foreignKey: "activity_id", as: "splits" });
ActivitySplit.associate({ Activity });
UserLog.associate({ User });

module.exports = {
  sequelize,
  User,
  Activity,
  ActivitySplit,
  Admin,
  UserLog,
};
