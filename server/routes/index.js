const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const activityRoutes = require("./activityRoutes");
const personalBestRoutes = require("./personalBestRoutes");
const adminRoutes = require("./adminRoutes");

// Auth routes (both paths for compatibility)
router.use("/auth", authRoutes);
router.use("/api/auth", authRoutes);

// API routes
router.use("/api/user", userRoutes);
router.use("/api/activities", activityRoutes);
router.use("/api/personal-best", personalBestRoutes);

// Admin routes
router.use("/admin", adminRoutes);

module.exports = router;

