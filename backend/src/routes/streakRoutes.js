const express = require("express");

const {
    getWorkoutStreak
} = require("../controllers/streakController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getWorkoutStreak);

module.exports = router;