const createWorkout = async (req, res) => {
    try {
        const { name, workout_date } = req.body;

        if (!name || !workout_date) {
            return res.status(400).json({
                error: "Workout name and date are required"
            });
        }

        const { data, error } = await req.supabase
            .from("workouts")
            .insert({
                user_id: req.user.id,
                name,
                workout_date
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(201).json(data);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};


const getWorkouts = async (req, res) => {
    try {
        const { data, error } = await req.supabase
            .from("workouts")
            .select("*")
            .order("workout_date", { ascending: false });

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};


const getWorkoutById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: workout, error: workoutError } = await req.supabase
            .from("workouts")
            .select("*")
            .eq("id", id)
            .single();

        if (workoutError) {
            return res.status(404).json({
                error: "Workout not found"
            });
        }

        const { data: workoutExercises, error: exerciseError } =
            await req.supabase
                .from("workout_exercises")
                .select(`
                    id,
                    exercise_id,
                    exercises (
                        id,
                        name,
                        muscle_group,
                        equipment
                    )
                `)
                .eq("workout_id", id);

        if (exerciseError) {
            return res.status(500).json({
                error: exerciseError.message
            });
        }

        for (const item of workoutExercises) {
            const { data: sets, error: setsError } =
                await req.supabase
                    .from("workout_sets")
                    .select("*")
                    .eq("workout_exercise_id", item.id)
                    .order("id");

            if (setsError) {
                return res.status(500).json({
                    error: setsError.message
                });
            }

            item.sets = sets;
        }

        res.json({
            ...workout,
            exercises: workoutExercises
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

const addExerciseToWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        const { exercise_id } = req.body;

        if (!exercise_id) {
            return res.status(400).json({
                error: "Exercise ID is required"
            });
        }

        const { data, error } = await req.supabase
            .from("workout_exercises")
            .insert({
                workout_id: id,
                exercise_id
            })
            .select(`
                id,
                workout_id,
                exercise_id,
                exercises (
                    id,
                    name,
                    muscle_group,
                    equipment
                )
            `)
            .single();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(201).json(data);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

const addSetToWorkoutExercise = async (req, res) => {
    try {
        const { workoutExerciseId } = req.params;
        const { weight, reps } = req.body;

        if (weight === undefined || reps === undefined) {
            return res.status(400).json({
                error: "Weight and reps are required"
            });
        }

        if (weight < 0 || reps <= 0) {
            return res.status(400).json({
                error: "Weight must be 0 or greater and reps must be greater than 0"
            });
        }

        const { data, error } = await req.supabase
            .from("workout_sets")
            .insert({
                workout_exercise_id: workoutExerciseId,
                weight,
                reps
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(201).json(data);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

const updateSet = async (req, res) => {
    try {
        const { id } = req.params;
        const { weight, reps } = req.body;

        if (weight === undefined || reps === undefined) {
            return res.status(400).json({
                error: "Weight and reps are required"
            });
        }

        if (weight < 0 || reps <= 0) {
            return res.status(400).json({
                error: "Weight must be 0 or greater and reps must be greater than 0"
            });
        }

        const { data, error } = await req.supabase
            .from("workout_sets")
            .update({
                weight,
                reps
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

const deleteSet = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await req.supabase
            .from("workout_sets")
            .delete()
            .eq("id", id);

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.json({
            message: "Set deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

const updateWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, workout_date } = req.body;

        if (!name || !workout_date) {
            return res.status(400).json({
                error: "Workout name and date are required"
            });
        }

        const { data, error } = await req.supabase
            .from("workouts")
            .update({
                name,
                workout_date
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

const deleteWorkout = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await req.supabase
            .from("workouts")
            .delete()
            .eq("id", id);

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.json({
            message: "Workout deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    addExerciseToWorkout,
    addSetToWorkoutExercise,
    updateSet,
    deleteSet,
    updateWorkout,
    deleteWorkout
};