const { User } = require("../models");

// Get user profile
const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: ["id", "strava_id", "name", "city", "country", "profile_picture", "badge_type_id", "createdAt"],
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Get profile error:", error.message);
        res.status(500).json({ error: "Failed to get profile" });
    }
};

module.exports = {
    getProfile,
};
