const express = require("express");
const router = express.Router();
const personalBestController = require("../controllers/personalBestController");

// Get personal best for a user
router.get("/:userId", personalBestController.getPersonalBest);

module.exports = router;
