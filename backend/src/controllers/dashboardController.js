const getDashboard = async (req, res) => {
    try {
        // Get all workouts of logged-in user
        const { data: workouts, error: workoutError } =
            await req.supabase
                .from("workouts")
                .select("id, workout_date");

        if (workoutError) {
            return res.status(500).json({
                error: workoutError.message
            });
        }

        // Get all workout exercises
        const { data: workoutExercises, error: exerciseError } =
            await req.supabase
                .from("workout_exercises")
                .select("id");

        if (exerciseError) {
            return res.status(500).json({
                error: exerciseError.message
            });
        }

        // Get all sets
        const { data: sets, error: setsError } =
            await req.supabase
                .from("workout_sets")
                .select("weight, reps");

        if (setsError) {
            return res.status(500).json({
                error: setsError.message
            });
        }

        // Calculate total volume
        const totalVolume = sets.reduce((total, set) => {
            return total + Number(set.weight) * Number(set.reps);
        }, 0);

        // Calculate workouts this week
        const today = new Date();
        const day = today.getDay();

        const monday = new Date(today);
        monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
        monday.setHours(0, 0, 0, 0);

        const workoutsThisWeek = workouts.filter(workout => {
            const workoutDate = new Date(workout.workout_date);
            return workoutDate >= monday;
        }).length;

        res.json({
            totalWorkouts: workouts.length,
            totalExercisesPerformed: workoutExercises.length,
            totalVolumeLifted: totalVolume,
            workoutsThisWeek
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    getDashboard
};