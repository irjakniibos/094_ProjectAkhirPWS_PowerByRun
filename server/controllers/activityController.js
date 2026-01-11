const { User, Activity, ActivitySplit } = require("../models");
const stravaService = require("../services/stravaService");

// Get all activities for a user
const getAllActivities = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, limit, offset } = req.query;

        const where = { user_id: userId };
        if (type) {
            where.type = type;
        }

        const activities = await Activity.findAll({
            where,
            order: [["start_date", "DESC"]],
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });

        res.json(activities);
    } catch (error) {
        console.error("Get activities error:", error.message);
        res.status(500).json({ error: "Failed to get activities" });
    }
};

// Sync activities from Strava
const syncActivities = async (req, res) => {
    try {
        const { userId } = req.params;
        const { forceRefresh } = req.query; // Add forceRefresh parameter

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get activities from Strava
        const stravaActivities = await stravaService.getAllActivities(user.access_token);

        let synced = 0;
        let skipped = 0;
        let detailFetched = 0; // Separate counter for detailed API calls

        for (const activity of stravaActivities) {
            // Only sync Run activities
            if (activity.type !== "Run") {
                skipped++;
                continue;
            }

            // Check if activity already exists with calories
            const existingActivity = await Activity.findOne({
                where: { strava_activity_id: activity.id }
            });

            let calories = existingActivity?.calories || null;

            // Check if splits exist for this activity
            let hasSplits = false;
            if (existingActivity) {
                const splitsCount = await ActivitySplit.count({
                    where: { activity_id: existingActivity.id }
                });
                hasSplits = splitsCount > 0;
            }

            // Fetch detailed activity if:
            // 1. We don't have calories yet, OR
            // 2. We don't have splits yet, OR
            // 3. forceRefresh is enabled
            // BUT limit to 50 per sync to avoid rate limiting
            let detailedActivity = null;
            if ((calories === null || !hasSplits || forceRefresh === 'true') && detailFetched < 50) {
                try {
                    detailedActivity = await stravaService.getDetailedActivity(user.access_token, activity.id);
                    calories = detailedActivity.calories || null;
                    detailFetched++; // Increment detail fetch counter
                    // Add delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (detailError) {
                    // If rate limited (429), skip remaining detailed fetches
                    if (detailError.response && detailError.response.status === 429) {
                        console.error('Rate limited by Strava API, skipping remaining detailed fetches');
                        detailFetched = 50; // Stop further detail fetches
                    } else {
                        console.error(`Failed to get detailed activity ${activity.id}:`, detailError.message);
                    }
                    // Continue with null calories if detailed fetch fails
                }
            }

            // Helper function to sanitize numeric values - prevent Infinity/NaN
            const sanitize = (val) => {
                if (val === null || val === undefined) return null;
                if (typeof val === 'number' && !isFinite(val)) return null;
                return val;
            };

            // Upsert activity
            let savedActivity;
            if (existingActivity) {
                await existingActivity.update({
                    name: activity.name || existingActivity.name,
                    distance: sanitize(activity.distance) || 0,
                    moving_time: sanitize(activity.moving_time) || 0,
                    elapsed_time: sanitize(activity.elapsed_time) || 0,
                    average_speed: sanitize(activity.average_speed),
                    average_heartrate: sanitize(activity.average_heartrate) || existingActivity.average_heartrate,
                    max_heartrate: sanitize(activity.max_heartrate) || existingActivity.max_heartrate,
                    total_elevation_gain: sanitize(activity.total_elevation_gain) || existingActivity.total_elevation_gain,
                    average_cadence: sanitize(activity.average_cadence) || existingActivity.average_cadence,
                    calories: sanitize(calories),
                    start_date: activity.start_date,
                });
                savedActivity = existingActivity;
            } else {
                savedActivity = await Activity.create({
                    strava_activity_id: activity.id,
                    name: activity.name || null,
                    distance: sanitize(activity.distance) || 0,
                    moving_time: sanitize(activity.moving_time) || 0,
                    elapsed_time: sanitize(activity.elapsed_time) || 0,
                    average_speed: sanitize(activity.average_speed),
                    average_heartrate: sanitize(activity.average_heartrate),
                    max_heartrate: sanitize(activity.max_heartrate),
                    total_elevation_gain: sanitize(activity.total_elevation_gain),
                    average_cadence: sanitize(activity.average_cadence),
                    calories: sanitize(calories),
                    type: activity.type,
                    start_date: activity.start_date,
                    user_id: userId,
                });
            }

            // Save splits if we have detailed activity data
            if (detailedActivity && detailedActivity.splits_metric) {
                // Delete existing splits for this activity
                await ActivitySplit.destroy({ where: { activity_id: savedActivity.id } });

                // Helper function to sanitize numeric values
                const sanitize = (val) => {
                    if (val === null || val === undefined) return null;
                    if (!isFinite(val)) return null;
                    return val;
                };

                // Create new splits
                const splitsToCreate = detailedActivity.splits_metric.map((split, index) => {
                    // Calculate pace - handle edge cases to avoid Infinity
                    let paceSeconds = null;
                    if (split.moving_time && split.distance && split.distance > 0) {
                        const pace = split.moving_time / (split.distance / 1000);
                        paceSeconds = isFinite(pace) ? Math.round(pace) : null;
                    }

                    return {
                        activity_id: savedActivity.id,
                        split_number: index + 1,
                        distance: sanitize(split.distance) || 0,
                        elapsed_time: sanitize(split.elapsed_time) || 0,
                        moving_time: sanitize(split.moving_time) || 0,
                        average_speed: sanitize(split.average_speed),
                        pace_seconds: sanitize(paceSeconds),
                        elevation_difference: sanitize(split.elevation_difference) || 0,
                        average_heartrate: sanitize(split.average_heartrate),
                    };
                });

                await ActivitySplit.bulkCreate(splitsToCreate);
            }

            synced++;
        }

        res.json({
            message: "Sync completed",
            synced,
            skipped,
            total: stravaActivities.length,
        });
    } catch (error) {
        console.error("Sync activities error:", error.message);

        if (error.response && error.response.status === 401) {
            return res.status(401).json({ error: "Token expired. Please re-authenticate." });
        }

        if (error.response && error.response.status === 429) {
            return res.status(429).json({
                error: "Rate limited by Strava. Please wait 15 minutes and try again."
            });
        }

        res.status(500).json({ error: "Failed to sync activities" });
    }
};

// Get activity stats
const getActivityStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const activities = await Activity.findAll({
            where: { user_id: userId, type: "Run" },
        });

        const stats = {
            totalActivities: activities.length,
            totalDistance: activities.reduce((sum, a) => sum + (a.distance || 0), 0),
            totalTime: activities.reduce((sum, a) => sum + (a.moving_time || 0), 0),
            averageDistance: 0,
            averagePace: 0,
        };

        if (activities.length > 0) {
            stats.averageDistance = stats.totalDistance / activities.length;
            stats.averagePace = stats.totalTime / 60 / (stats.totalDistance / 1000);
        }

        stats.totalDistanceKm = (stats.totalDistance / 1000).toFixed(2);
        stats.averageDistanceKm = (stats.averageDistance / 1000).toFixed(2);
        stats.averagePaceFormatted = formatPace(stats.averagePace);

        res.json(stats);
    } catch (error) {
        console.error("Get stats error:", error.message);
        res.status(500).json({ error: "Failed to get stats" });
    }
};

// Helper: format pace as mm:ss
const formatPace = (paceMinPerKm) => {
    if (!paceMinPerKm || !isFinite(paceMinPerKm)) return "0:00";
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Get splits for an activity
const getActivitySplits = async (req, res) => {
    try {
        const { activityId } = req.params;

        const activity = await Activity.findByPk(activityId);
        if (!activity) {
            return res.status(404).json({ error: "Activity not found" });
        }

        const splits = await ActivitySplit.findAll({
            where: { activity_id: activityId },
            order: [["split_number", "ASC"]],
        });

        res.json({
            activity: {
                id: activity.id,
                name: activity.name,
                distance: activity.distance,
                moving_time: activity.moving_time,
            },
            splits,
        });
    } catch (error) {
        console.error("Get splits error:", error.message);
        res.status(500).json({ error: "Failed to get splits" });
    }
};

// Get weekly stats for past 12 weeks
const getWeeklyStats = async (req, res) => {
    try {
        const { userId } = req.params;

        // Calculate date 12 weeks ago
        const now = new Date();
        const twelveWeeksAgo = new Date(now);
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks * 7 days

        // Get all activities in the last 12 weeks
        const activities = await Activity.findAll({
            where: {
                user_id: userId,
                type: "Run",
                start_date: {
                    [require('sequelize').Op.gte]: twelveWeeksAgo
                }
            },
            order: [["start_date", "ASC"]],
        });

        // Group activities by week
        const weeklyData = [];

        // Generate 12 weeks of data (including current week)
        for (let i = 11; i >= 0; i--) {
            const weekStart = new Date(now);
            // Calculate days to subtract to get to Monday
            // getDay() returns 0=Sun, 1=Mon, 2=Tue, etc.
            // If Sunday (0), go back 6 days. Otherwise go back (day - 1) days
            const dayOfWeek = weekStart.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(weekStart.getDate() - daysToMonday - (i * 7));
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            // Find activities in this week
            const weekActivities = activities.filter(a => {
                const actDate = new Date(a.start_date);
                return actDate >= weekStart && actDate < weekEnd;
            });

            // Calculate totals
            const totalDistance = weekActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
            const totalTime = weekActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0);
            const totalElevation = weekActivities.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0);

            // Get month label
            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

            weeklyData.push({
                weekStart: weekStart.toISOString(),
                weekLabel: `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]}`,
                month: monthNames[weekStart.getMonth()],
                distance: totalDistance,
                distanceKm: (totalDistance / 1000).toFixed(2),
                time: totalTime,
                elevation: totalElevation,
                activityCount: weekActivities.length,
            });
        }

        // Calculate this week's totals (last item in array)
        const thisWeek = weeklyData[weeklyData.length - 1];

        res.json({
            thisWeek: {
                distance: thisWeek.distance,
                distanceKm: thisWeek.distanceKm,
                time: thisWeek.time,
                elevation: thisWeek.elevation,
                activityCount: thisWeek.activityCount,
            },
            weeklyData,
        });
    } catch (error) {
        console.error("Get weekly stats error:", error.message);
        res.status(500).json({ error: "Failed to get weekly stats" });
    }
};

module.exports = {
    getAllActivities,
    syncActivities,
    getActivityStats,
    getActivitySplits,
    getWeeklyStats,
};

