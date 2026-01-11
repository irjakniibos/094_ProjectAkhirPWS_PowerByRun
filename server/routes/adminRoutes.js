const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Public routes
router.post("/register", adminController.register);
router.post("/login", adminController.login);

// Protected routes (require token)
router.get("/users", adminController.verifyToken, adminController.getAllUsers);
router.get("/logs", adminController.verifyToken, adminController.getUserLogs);
router.get("/logs/:userId", adminController.verifyToken, adminController.getUserLogs);
router.get("/dashboard", adminController.verifyToken, adminController.getDashboardStats);

module.exports = router;
