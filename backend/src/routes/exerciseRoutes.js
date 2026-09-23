const express = require("express");

const {
    getExercises,
    addExercise,
    updateExercise,
    deleteExercise
} = require("../controllers/exerciseController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getExercises);
router.post("/", addExercise);
router.put("/:id", updateExercise);
router.delete("/:id", deleteExercise);

module.exports = router;