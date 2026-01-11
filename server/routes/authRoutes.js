const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Redirect to Strava OAuth
router.get("/strava", authController.redirectToStrava);

// Handle OAuth callback
router.get("/callback", authController.handleCallback);

// Get current user
router.get("/user/:userId", authController.getCurrentUser);

// Sync profile from Strava
router.post("/sync-profile/:userId", authController.syncProfile);

// Handle logout
router.post("/logout/:userId", authController.handleLogout);

module.exports = router;

