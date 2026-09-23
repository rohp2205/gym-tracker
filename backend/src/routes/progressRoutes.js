const express = require("express");

const {
    getExerciseProgress
} = require("../controllers/progressController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/exercise/:exerciseId", getExerciseProgress);

module.exports = router;