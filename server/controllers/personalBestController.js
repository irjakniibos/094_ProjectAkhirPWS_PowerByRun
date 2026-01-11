const { Activity } = require("../models");
const { Op } = require("sequelize");

// Personal Best distances (3K, 5K, 10K, Half Marathon, Marathon)
const PB_DISTANCES = {
    "3K": 3000,
    "5K": 5000,
    "10K": 10000,
    "Half Marathon": 21097,
    "Marathon": 42195,
};

// Maximum allowed time difference (elapsed - moving) in seconds
// If difference > threshold, the run is considered "paused" and less preferred
const MAX_TIME_DIFF_SECONDS = 300; // 5 minutes

// Get Personal Best for a user
// Logic: Find activities with distance >= target, prefer those with small elapsed-moving diff
const getPersonalBest = async (req, res) => {
    try {
        const { userId } = req.params;

        const personalBests = {};

        for (const [name, distance] of Object.entries(PB_DISTANCES)) {
            // Find activities that cover at least this distance
            const activities = await Activity.findAll({
                where: {
                    user_id: userId,
                    type: "Run",
                    distance: { [Op.gte]: distance },
                },
            });

            if (activities.length > 0) {
                // Calculate time for target distance and time difference for each activity
                const candidates = activities.map(activity => {
                    const pacePerMeter = activity.moving_time / activity.distance;
                    const estimatedMovingTime = pacePerMeter * distance;

                    const elapsedPacePerMeter = (activity.elapsed_time || activity.moving_time) / activity.distance;
                    const estimatedElapsedTime = elapsedPacePerMeter * distance;

                    const timeDifference = estimatedElapsedTime - estimatedMovingTime;

                    return {
                        activity,
                        estimatedMovingTime,
                        estimatedElapsedTime,
                        timeDifference,
                    };
                });

                // Filter out runs with large time difference (paused runs)
                const cleanRuns = candidates.filter(c => c.timeDifference <= MAX_TIME_DIFF_SECONDS);

                // Use clean runs if available, otherwise use all
                const validCandidates = cleanRuns.length > 0 ? cleanRuns : candidates;

                // Sort by estimated moving time (fastest first), then by time difference (smallest first)
                validCandidates.sort((a, b) => {
                    if (a.estimatedMovingTime !== b.estimatedMovingTime) {
                        return a.estimatedMovingTime - b.estimatedMovingTime;
                    }
                    return a.timeDifference - b.timeDifference;
                });

                const best = validCandidates[0];

                personalBests[name] = {
                    distance: distance,
                    distanceKm: (distance / 1000).toFixed(2),
                    // Time data
                    movingTime: Math.round(best.estimatedMovingTime),
                    movingTimeFormatted: formatTime(best.estimatedMovingTime),
                    elapsedTime: Math.round(best.estimatedElapsedTime),
                    elapsedTimeFormatted: formatTime(best.estimatedElapsedTime),
                    timeDifference: Math.round(best.timeDifference),
                    timeDifferenceFormatted: formatTime(best.timeDifference),
                    // Pace
                    pace: formatPace(best.estimatedMovingTime / 60 / (distance / 1000)),
                    // Activity info
                    activityId: best.activity.strava_activity_id,
                    activityDate: best.activity.start_date,
                };
            } else {
                personalBests[name] = null;
            }
        }

        res.json(personalBests);
    } catch (error) {
        console.error("Get personal best error:", error.message);
        res.status(500).json({ error: "Failed to get personal best" });
    }
};

// Helper: format time as HH:MM:SS or MM:SS
const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds) || seconds < 0) return "0:00";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper: format pace as mm:ss per km
const formatPace = (paceMinPerKm) => {
    if (!paceMinPerKm || !isFinite(paceMinPerKm)) return "0:00";
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
};

module.exports = {
    getPersonalBest,
};
