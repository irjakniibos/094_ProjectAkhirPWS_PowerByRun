module.exports = (sequelize, DataTypes) => {
    const UserLog = sequelize.define("user_log", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_name: {
            type: DataTypes.STRING,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
            // Actions: 'login', 'view_dashboard', 'view_activities', 'sync_activities', 'view_pb', 'view_profile'
        },
        details: {
            type: DataTypes.TEXT,
        },
    });

    UserLog.associate = (models) => {
        UserLog.belongsTo(models.User, { foreignKey: "user_id" });
    };

    return UserLog;
};
