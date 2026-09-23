const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { supabase } = require("./db/supabase");

const authRoutes = require("./routes/authRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const progressRoutes = require("./routes/progressRoutes");
const streakRoutes = require("./routes/streakRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Gym Tracker API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/streak", streakRoutes);

app.get("/api/test-db", async (req, res) => {
    const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .limit(1);

    if (error)
        return res.status(500).json({ error: error.message });

    res.json({
        message: "Database connected successfully",
        data
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});