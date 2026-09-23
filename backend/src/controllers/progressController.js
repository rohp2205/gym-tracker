const getExerciseProgress = async (req, res) => {
    try {
        const { exerciseId } = req.params;

        // Get workouts containing this exercise
        const { data: workoutExercises, error: exerciseError } =
            await req.supabase
                .from("workout_exercises")
                .select(`
                    id,
                    workout_id,
                    workouts (
                        id,
                        name,
                        workout_date
                    )
                `)
                .eq("exercise_id", exerciseId);

        if (exerciseError) {
            return res.status(500).json({
                error: exerciseError.message
            });
        }

        if (!workoutExercises || workoutExercises.length === 0) {
            return res.json({
                message: "No progress data available"
            });
        }

        const sessions = [];

        for (const workoutExercise of workoutExercises) {
            const { data: sets, error: setsError } =
                await req.supabase
                    .from("workout_sets")
                    .select("weight, reps")
                    .eq("workout_exercise_id", workoutExercise.id);

            if (setsError) {
                return res.status(500).json({
                    error: setsError.message
                });
            }

            if (sets.length > 0) {
                const bestWeight = Math.max(
                    ...sets.map(set => Number(set.weight))
                );

                const bestReps = Math.max(
                    ...sets.map(set => Number(set.reps))
                );

                const estimated1RM = Math.max(
                    ...sets.map(set =>
                        Number(set.weight) *
                        (1 + Number(set.reps) / 30)
                    )
                );

                sessions.push({
                    workoutId: workoutExercise.workout_id,
                    workoutName: workoutExercise.workouts.name,
                    workoutDate: workoutExercise.workouts.workout_date,
                    bestWeight,
                    bestReps,
                    estimated1RM: Number(estimated1RM.toFixed(2))
                });
            }
        }

        sessions.sort(
            (a, b) =>
                new Date(a.workoutDate) -
                new Date(b.workoutDate)
        );

        const current = sessions[sessions.length - 1];
        const previous = sessions.length > 1
            ? sessions[sessions.length - 2]
            : null;

        let status = "→ Maintained";

        if (previous) {
            if (current.estimated1RM > previous.estimated1RM) {
                status = "↑ Improved";
            } else if (current.estimated1RM < previous.estimated1RM) {
                status = "↓ Decreased";
            }
        }

        const bestWeight = Math.max(
            ...sessions.map(session => session.bestWeight)
        );

        const bestReps = Math.max(
            ...sessions.map(session => session.bestReps)
        );

        res.json({
            exerciseId: Number(exerciseId),
            previousSession: previous,
            currentSession: current,
            bestWeight,
            bestReps,
            status
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    getExerciseProgress
};