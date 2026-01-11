const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");

// Get all activities for a user
router.get("/:userId", activityController.getAllActivities);

// Get activity stats for a user
router.get("/:userId/stats", activityController.getActivityStats);

// Get weekly stats for past 12 weeks
router.get("/:userId/weekly", activityController.getWeeklyStats);

// Get splits for an activity
router.get("/splits/:activityId", activityController.getActivitySplits);

// Sync activities from Strava
router.post("/sync/:userId", activityController.syncActivities);

module.exports = router;

