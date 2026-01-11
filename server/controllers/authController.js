const stravaService = require("../services/stravaService");
const { User, UserLog } = require("../models");

// Redirect to Strava OAuth
const redirectToStrava = (req, res) => {
    const authUrl = stravaService.getAuthUrl();
    res.redirect(authUrl);
};

// Handle OAuth callback
const handleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: "Authorization code not provided" });
        }

        // Exchange code for tokens
        const tokenData = await stravaService.getAccessToken(code);

        // Get athlete profile
        const athlete = await stravaService.getAthleteProfile(tokenData.access_token);

        // Upsert user in database
        const [user, created] = await User.findOrCreate({
            where: { strava_id: athlete.id },
            defaults: {
                strava_id: athlete.id,
                name: `${athlete.firstname} ${athlete.lastname}`,
                city: athlete.city || null,
                country: athlete.country || null,
                profile_picture: athlete.profile || athlete.profile_medium || null,
                badge_type_id: athlete.badge_type_id || 0,
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
            },
        });

        // Update tokens if user already exists
        if (!created) {
            await user.update({
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                name: `${athlete.firstname} ${athlete.lastname}`,
                city: athlete.city || null,
                country: athlete.country || null,
                profile_picture: athlete.profile || athlete.profile_medium || null,
                badge_type_id: athlete.badge_type_id || 0,
            });
        }

        // Log user login
        await UserLog.create({
            user_id: user.id,
            user_name: user.name,
            action: "login",
            details: `User logged in via Strava`,
        });

        // Redirect to frontend with user ID
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/dashboard?userId=${user.id}`);
    } catch (error) {
        console.error("OAuth callback error:", error.message);
        res.status(500).json({ error: "Authentication failed" });
    }
};

// Get current user info
const getCurrentUser = async (req, res) => {
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
        console.error("Get user error:", error.message);
        res.status(500).json({ error: "Failed to get user" });
    }
};

// Handle user logout
const handleLogout = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Log user logout
        await UserLog.create({
            user_id: user.id,
            user_name: user.name,
            action: "logout",
            details: "User logged out from dashboard",
        });

        res.json({ message: "Logout logged successfully" });
    } catch (error) {
        console.error("Logout error:", error.message);
        res.status(500).json({ error: "Failed to log logout" });
    }
};

// Sync profile from Strava (get latest profile picture)
const syncProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let athlete;
        try {
            // Try with existing access token
            athlete = await stravaService.getAthleteProfile(user.access_token);
        } catch (err) {
            // If unauthorized, refresh token and retry
            if (err.response && err.response.status === 401 && user.refresh_token) {
                const tokenData = await stravaService.refreshAccessToken(user.refresh_token);
                await user.update({ access_token: tokenData.access_token, refresh_token: tokenData.refresh_token || user.refresh_token });
                athlete = await stravaService.getAthleteProfile(tokenData.access_token);
            } else {
                throw err;
            }
        }

        // Update user with latest profile data
        await user.update({
            name: `${athlete.firstname} ${athlete.lastname}`,
            city: athlete.city || user.city,
            country: athlete.country || user.country,
            profile_picture: athlete.profile || athlete.profile_medium || null,
            badge_type_id: athlete.badge_type_id || 0,
        });

        res.json({
            message: "Profile synced successfully",
            user: {
                id: user.id,
                name: `${athlete.firstname} ${athlete.lastname}`,
                profile_picture: athlete.profile || athlete.profile_medium,
            },
        });
    } catch (error) {
        console.error("Sync profile error:", error.message);
        res.status(500).json({ error: "Failed to sync profile" });
    }
};

module.exports = {
    redirectToStrava,
    handleCallback,
    getCurrentUser,
    handleLogout,
    syncProfile,
};
