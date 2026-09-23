const getWorkoutStreak = async (req, res) => {
    try {
        const { data: workouts, error } = await req.supabase
            .from("workouts")
            .select("workout_date")
            .order("workout_date", { ascending: true });

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        if (!workouts || workouts.length === 0) {
            return res.json({
                currentStreak: 0,
                longestStreak: 0
            });
        }

        // Remove duplicate workout dates
        const dates = [
            ...new Set(
                workouts.map(workout => workout.workout_date)
            )
        ].sort();

        let longestStreak = 1;
        let currentStreak = 1;

        let streak = 1;

        for (let i = 1; i < dates.length; i++) {
            const previousDate = new Date(dates[i - 1]);
            const currentDate = new Date(dates[i]);

            const difference =
                (currentDate - previousDate) /
                (1000 * 60 * 60 * 24);

            if (difference === 1) {
                streak++;

                if (streak > longestStreak) {
                    longestStreak = streak;
                }
            } else {
                streak = 1;
            }
        }

        // Calculate current streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const latestDate = new Date(
            dates[dates.length - 1]
        );

        latestDate.setHours(0, 0, 0, 0);

        const daysSinceLatest =
            Math.floor(
                (today - latestDate) /
                (1000 * 60 * 60 * 24)
            );

        if (daysSinceLatest > 1) {
            currentStreak = 0;
        } else {
            currentStreak = 1;

            for (let i = dates.length - 1; i > 0; i--) {
                const currentDate = new Date(dates[i]);
                const previousDate = new Date(dates[i - 1]);

                const difference =
                    (currentDate - previousDate) /
                    (1000 * 60 * 60 * 24);

                if (difference === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        res.json({
            currentStreak,
            longestStreak
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    getWorkoutStreak
};