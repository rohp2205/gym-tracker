const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    addExerciseToWorkout,
    addSetToWorkoutExercise,
    updateSet,
    deleteSet,
    updateWorkout,
    deleteWorkout
} = require("../controllers/workoutController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createWorkout);
router.get("/", getWorkouts);
router.get("/:id", getWorkoutById);

router.put("/:id", updateWorkout);
router.delete("/:id", deleteWorkout);

router.post("/:id/exercises", addExerciseToWorkout);

router.post(
    "/:workoutId/exercises/:workoutExerciseId/sets",
    addSetToWorkoutExercise
);

router.put("/sets/:id", updateSet);
router.delete("/sets/:id", deleteSet);

module.exports = router;