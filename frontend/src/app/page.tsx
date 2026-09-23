"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  TrendingUp,
  Flame,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
  Save
} from "lucide-react";
import { api } from "../lib/api";

type Exercise = {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string;
};

type WorkoutSet = {
  id: number;
  weight: number;
  reps: number;
};

type WorkoutExercise = {
  id: number;
  exercise_id: number;
  exercises?: Exercise;
  sets?: WorkoutSet[];
};

type Workout = {
  id: number;
  name: string;
  workout_date: string;
  workout_exercises?: WorkoutExercise[];
};

type Dashboard = {
  totalWorkouts: number;
  totalExercisesPerformed: number;
  totalVolumeLifted: number;
  workoutsThisWeek: number;
};

type Progress = {
  previousSession: {
    workoutName: string;
    workoutDate: string;
    bestWeight: number;
    bestReps: number;
    estimated1RM: number;
  } | null;
  currentSession: {
    workoutName: string;
    workoutDate: string;
    bestWeight: number;
    bestReps: number;
    estimated1RM: number;
  };
  bestWeight: number;
  bestReps: number;
  status: string;
};

type Streak = {
  currentStreak: number;
  longestStreak: number;
};

type Tab =
  | "dashboard"
  | "exercises"
  | "workouts"
  | "progress"
  | "streak";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(
    null
  );
  const [progress, setProgress] = useState<Progress | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);

  const [exerciseName, setExerciseName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");

  const [editingExercise, setEditingExercise] =
    useState<Exercise | null>(null);

  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [selectedProgressExercise, setSelectedProgressExercise] =
    useState("");

  const [setWeight, setSetWeight] = useState("");
  const [setReps, setSetReps] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadDashboard();
      loadExercises();
      loadWorkouts();
      loadStreak();
    }
  }, [token]);

  useEffect(() => {
    if (selectedWorkout?.id) {
      refreshSelectedWorkout(selectedWorkout.id);
    }
  }, [selectedWorkout?.id]);

  async function loadDashboard() {
    try {
      const data = await api("/api/dashboard");
      setDashboard(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadExercises() {
    try {
      const data = await api("/api/exercises");
      setExercises(data);

      if (data.length && !selectedProgressExercise) {
        setSelectedProgressExercise(String(data[0].id));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function loadWorkouts() {
    try {
      const data = await api("/api/workouts");
      setWorkouts(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadStreak() {
    try {
      const data = await api("/api/streak");
      setStreak(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function refreshSelectedWorkout(id: number) {
    try {
      const data = await api(`/api/workouts/${id}`);
      setSelectedWorkout(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (authMode === "register") {
        await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password
          })
        });

        setMessage(
          "Registration successful. You can now login."
        );

        setAuthMode("login");
        setPassword("");
      } else {
        const data = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password
          })
        });

        localStorage.setItem("token", data.token);
        setToken(data.token);
        setMessage("");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setDashboard(null);
    setExercises([]);
    setWorkouts([]);
    setSelectedWorkout(null);
  }

  async function addExercise(e: React.FormEvent) {
    e.preventDefault();

    try {
      await api("/api/exercises", {
        method: "POST",
        body: JSON.stringify({
          name: exerciseName,
          muscle_group: muscleGroup,
          equipment
        })
      });

      setExerciseName("");
      setMuscleGroup("");
      setEquipment("");
      setMessage("Exercise added successfully.");
      loadExercises();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed"
      );
    }
  }

  async function updateExercise() {
    if (!editingExercise) return;

    try {
      await api(`/api/exercises/${editingExercise.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editingExercise.name,
          muscle_group: editingExercise.muscle_group,
          equipment: editingExercise.equipment
        })
      });

      setEditingExercise(null);
      setMessage("Exercise updated successfully.");
      loadExercises();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed"
      );
    }
  }

  async function deleteExercise(id: number) {
    if (!confirm("Delete this exercise?")) return;

    try {
      await api(`/api/exercises/${id}`, {
        method: "DELETE"
      });

      loadExercises();
      setMessage("Exercise deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed"
      );
    }
  }

  async function createWorkout(e: React.FormEvent) {
    e.preventDefault();

    try {
      const data = await api("/api/workouts", {
        method: "POST",
        body: JSON.stringify({
          name: workoutName,
          workout_date: workoutDate
        })
      });

      setWorkoutName("");
      setSelectedWorkout(data);

      await loadWorkouts();
      await refreshSelectedWorkout(data.id);
      await loadDashboard();
      await loadStreak();

      setMessage("Workout created successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed"
      );
    }
  }

  async function addExerciseToWorkout() {
    if (!selectedWorkout || !selectedExerciseId) return;

    try {
      await api(
        `/api/workouts/${selectedWorkout.id}/exercises`,
        {
          method: "POST",
          body: JSON.stringify({
            exercise_id: Number(selectedExerciseId)
          })
        }
      );

      await refreshSelectedWorkout(selectedWorkout.id);
      await loadDashboard();

      setSelectedExerciseId("");
      setMessage("Exercise added to workout.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed"
      );
    }
  }

  async function addSet(workoutExerciseId: number) {
    const weight = Number(setWeight);
    const reps = Number(setReps);

    if (!selectedWorkout || weight < 0 || reps <= 0) {
      setMessage("Enter valid weight and reps.");
      return;
    }

    try {
      await api(
        `/api/workouts/${selectedWorkout.id}/exercises/${workoutExerciseId}/sets`,
        {
          method: "POST",
          body: JSON.stringify({
            weight,
            reps
          })
        }
      );

      setSetWeight("");
      setSetReps("");

      await refreshSelectedWorkout(selectedWorkout.id);
      await loadDashboard();

      setMessage("Set added.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed"
      );
    }
  }

  async function editSet(set: WorkoutSet) {
    const weight = prompt("Weight:", String(set.weight));
    const reps = prompt("Reps:", String(set.reps));

    if (weight === null || reps === null) return;

    try {
      await api(`/api/workouts/sets/${set.id}`, {
        method: "PUT",
        body: JSON.stringify({
          weight: Number(weight),
          reps: Number(reps)
        })
      });

      if (selectedWorkout) {
        await refreshSelectedWorkout(selectedWorkout.id);
      }

      await loadDashboard();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed"
      );
    }
  }

  async function deleteSet(setId: number) {
    if (!confirm("Delete this set?")) return;

    try {
      await api(`/api/workouts/sets/${setId}`, {
        method: "DELETE"
      });

      if (selectedWorkout) {
        await refreshSelectedWorkout(selectedWorkout.id);
      }

      await loadDashboard();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed"
      );
    }
  }

  async function deleteWorkout(id: number) {
    if (!confirm("Delete this workout?")) return;

    try {
      await api(`/api/workouts/${id}`, {
        method: "DELETE"
      });

      if (selectedWorkout?.id === id) {
        setSelectedWorkout(null);
      }

      await loadWorkouts();
      await loadDashboard();
      await loadStreak();

      setMessage("Workout deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed"
      );
    }
  }

  async function loadProgress() {
    if (!selectedProgressExercise) return;

    try {
      const data = await api(
        `/api/progress/exercise/${selectedProgressExercise}`
      );

      setProgress(data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No progress"
      );
    }
  }

  if (!token) {
    if (!showAuth) {
      return (
        <main className="landing-page">

          {/* NAVBAR */}
          <nav className="landing-nav">
            <div className="landing-logo">
              <Dumbbell size={30} />
              <span>GymTracker</span>
            </div>

            <div className="landing-links">
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({
                      behavior: "smooth"
                    })
                }
              >
                Features
              </button>

              <button
                onClick={() => {
                  setAuthMode("login");
                  setShowAuth(true);
                }}
              >
                Login
              </button>

              <button
                className="nav-cta"
                onClick={() => {
                  setAuthMode("register");
                  setShowAuth(true);
                }}
              >
                Get Started
              </button>
            </div>
          </nav>

          {/* HERO */}
          <section className="landing-hero">

            <div className="hero-content">

              <div className="hero-badge">
                <Dumbbell size={16} />
                YOUR PERSONAL FITNESS TRACKER
              </div>

              <h1>
                Train Smart.
                <br />
                <span>Build Strong.</span>
              </h1>

              <p>
                Track your workouts, monitor your
                strength, calculate your training volume,
                and build unstoppable consistency.
              </p>

              <div className="hero-buttons">

                <button
                  className="hero-primary"
                  onClick={() => {
                    setAuthMode("register");
                    setShowAuth(true);
                  }}
                >
                  Start Training
                  <span>→</span>
                </button>

                <button
                  className="hero-secondary"
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuth(true);
                  }}
                >
                  Login
                </button>

              </div>

              <div className="hero-stats">
                <div>
                  <strong>100%</strong>
                  <span>Your Data</span>
                </div>

                <div>
                  <strong>24/7</strong>
                  <span>Tracking</span>
                </div>

                <div>
                  <strong>∞</strong>
                  <span>Workouts</span>
                </div>
              </div>

            </div>

            <div className="hero-visual">

              <div className="hero-glow"></div>

              <div className="fitness-card main-fitness-card">

                <div className="fitness-card-top">
                  <span>Today's Workout</span>
                  <Flame size={20} />
                </div>

                <h3>Strength Training</h3>

                <div className="mock-progress">
                  <div></div>
                </div>

                <div className="fitness-metrics">

                  <div>
                    <strong>5</strong>
                    <span>Exercises</span>
                  </div>

                  <div>
                    <strong>12</strong>
                    <span>Sets</span>
                  </div>

                  <div>
                    <strong>2.4K</strong>
                    <span>Volume</span>
                  </div>

                </div>

              </div>

              <div className="floating-card progress-floating">
                <TrendingUp size={20} />
                <div>
                  <strong>+12.5%</strong>
                  <span>Progress</span>
                </div>
              </div>

              <div className="floating-card streak-floating">
                <Flame size={20} />
                <div>
                  <strong>7 Days</strong>
                  <span>Streak</span>
                </div>
              </div>

            </div>

          </section>

          {/* FEATURES */}
          <section
            id="features"
            className="features-section"
          >

            <div className="section-heading">

              <span className="eyebrow">
                EVERYTHING YOU NEED
              </span>

              <h2>
                Your complete fitness
                <span> command center.</span>
              </h2>

              <p>
                Everything you need to track,
                understand and improve your training.
              </p>

            </div>

            <div className="feature-grid">

              <FeatureCard
                icon={<Dumbbell />}
                title="Exercise Management"
                text="Create, edit and organize your exercises with muscle groups and equipment."
                onClick={() => {
                  setAuthMode("register");
                  setShowAuth(true);
                }}
              />

              <FeatureCard
                icon={<ClipboardList />}
                title="Workout Logging"
                text="Record workouts, exercises, sets, reps and weights in one place."
                onClick={() => {
                  setAuthMode("register");
                  setShowAuth(true);
                }}
              />

              <FeatureCard
                icon={<TrendingUp />}
                title="Progress Tracking"
                text="Compare sessions and track estimated 1RM, best weight and reps."
                onClick={() => {
                  setAuthMode("register");
                  setShowAuth(true);
                }}
              />

              <FeatureCard
                icon={<Flame />}
                title="Workout Streak"
                text="Build consistency by tracking your current and longest workout streak."
                onClick={() => {
                  setAuthMode("register");
                  setShowAuth(true);
                }}
              />

            </div>

          </section>

          {/* HOW IT WORKS */}
          <section className="how-section">

            <div className="section-heading">

              <span className="eyebrow">
                SIMPLE WORKFLOW
              </span>

              <h2>
                From workout to
                <span> progress.</span>
              </h2>

            </div>

            <div className="steps-grid">

              <Step
                number="01"
                title="Create Exercises"
                text="Add your exercises, muscle groups and equipment."
              />

              <Step
                number="02"
                title="Log Workouts"
                text="Record your exercises, sets, reps and weight."
              />

              <Step
                number="03"
                title="Track Progress"
                text="Analyze your performance and build your streak."
              />

            </div>

          </section>

          {/* CTA */}
          <section className="landing-cta">

            <div>
              <span className="eyebrow">
                READY TO TRAIN?
              </span>

              <h2>
                Your next workout
                starts here.
              </h2>

              <p>
                Create your free account and
                start tracking today.
              </p>
            </div>

            <button
              className="hero-primary"
              onClick={() => {
                setAuthMode("register");
                setShowAuth(true);
              }}
            >
              Create Account →
            </button>

          </section>

          {/* FOOTER */}
          <footer className="landing-footer">

            <div className="landing-logo">
              <Dumbbell size={24} />
              <span>GymTracker</span>
            </div>

            <p>
              © 2026 GymTracker. Train smarter.
            </p>

          </footer>

        </main>
      );
    }

    return (
      <main className="auth-page">

        <div className="auth-card">

          <button
            className="back-home"
            onClick={() => {
              setShowAuth(false);
              setMessage("");
            }}
          >
            ← Back to Home
          </button>

          <div className="brand">
            <Dumbbell size={42} />
            <h1>GymTracker</h1>
          </div>

          <p className="auth-subtitle">
            Track workouts. Build strength. Stay consistent.
          </p>

          <div className="auth-tabs">

            <button
              className={
                authMode === "login"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setAuthMode("login");
                setMessage("");
              }}
            >
              Login
            </button>

            <button
              className={
                authMode === "register"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setAuthMode("register");
                setMessage("");
              }}
            >
              Register
            </button>

          </div>

          <form onSubmit={handleAuth}>

            {authMode === "register" && (
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              className="primary-btn full"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : authMode === "login"
                  ? "Login"
                  : "Create Account"}
            </button>

          </form>

          {message && (
            <div className="message">
              {message}
            </div>
          )}

        </div>

      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Dumbbell size={30} />
          <span>GymTracker</span>
        </div>

        <nav>
          <NavButton
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active={tab === "dashboard"}
            onClick={() => setTab("dashboard")}
          />

          <NavButton
            icon={<Dumbbell size={19} />}
            label="Exercises"
            active={tab === "exercises"}
            onClick={() => setTab("exercises")}
          />

          <NavButton
            icon={<ClipboardList size={19} />}
            label="Workouts"
            active={tab === "workouts"}
            onClick={() => setTab("workouts")}
          />

          <NavButton
            icon={<TrendingUp size={19} />}
            label="Progress"
            active={tab === "progress"}
            onClick={() => setTab("progress")}
          />

          <NavButton
            icon={<Flame size={19} />}
            label="Streak"
            active={tab === "streak"}
            onClick={() => setTab("streak")}
          />
        </nav>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <h1>
              {tab === "dashboard" && "Dashboard"}
              {tab === "exercises" && "Exercises"}
              {tab === "workouts" && "Workout Logger"}
              {tab === "progress" && "Progress Tracking"}
              {tab === "streak" && "Workout Streak"}
            </h1>

            <p>
              Keep your training organized and measurable.
            </p>
          </div>
        </header>

        {message && (
          <div className="message global-message">
            {message}
            <button
              onClick={() => setMessage("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {tab === "dashboard" && dashboard && (
          <div className="dashboard">
            <div className="stats-grid">
              <StatCard
                icon={<ClipboardList />}
                title="Total Workouts"
                value={dashboard.totalWorkouts}
              />

              <StatCard
                icon={<Dumbbell />}
                title="Exercises Performed"
                value={
                  dashboard.totalExercisesPerformed
                }
              />

              <StatCard
                icon={<TrendingUp />}
                title="Volume Lifted"
                value={`${dashboard.totalVolumeLifted} kg`}
              />

              <StatCard
                icon={<Flame />}
                title="This Week"
                value={dashboard.workoutsThisWeek}
              />
            </div>

            <div className="dashboard-grid">
              <div className="panel hero-panel">
                <span className="eyebrow">
                  TRAIN SMART
                </span>
                <h2>
                  Your progress starts with
                  consistency.
                </h2>
                <p>
                  Log every workout, monitor your
                  strength and keep your streak alive.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    setTab("workouts")
                  }
                >
                  <Plus size={18} />
                  Log Workout
                </button>
              </div>

              <div className="panel">
                <div className="panel-title">
                  <Flame />
                  <h3>Current Streak</h3>
                </div>

                <div className="big-number">
                  {streak?.currentStreak || 0}
                </div>

                <p>consecutive workout days</p>
              </div>
            </div>
          </div>
        )}

        {tab === "exercises" && (
          <div className="section-grid">
            <div className="panel">
              <div className="panel-title">
                <Plus />
                <h3>Add Exercise</h3>
              </div>

              <form onSubmit={addExercise}>
                <input
                  placeholder="Exercise name"
                  value={exerciseName}
                  onChange={(e) =>
                    setExerciseName(
                      e.target.value
                    )
                  }
                  required
                />

                <input
                  placeholder="Muscle group"
                  value={muscleGroup}
                  onChange={(e) =>
                    setMuscleGroup(
                      e.target.value
                    )
                  }
                  required
                />

                <input
                  placeholder="Equipment"
                  value={equipment}
                  onChange={(e) =>
                    setEquipment(
                      e.target.value
                    )
                  }
                  required
                />

                <button className="primary-btn">
                  <Plus size={18} />
                  Add Exercise
                </button>
              </form>
            </div>

            <div className="panel wide">
              <div className="panel-title">
                <Dumbbell />
                <h3>My Exercises</h3>
              </div>

              {exercises.length === 0 ? (
                <Empty text="No exercises yet." />
              ) : (
                <div className="exercise-list">
                  {exercises.map((exercise) => (
                    <div
                      className="exercise-item"
                      key={exercise.id}
                    >
                      <div>
                        <strong>
                          {exercise.name}
                        </strong>
                        <span>
                          {
                            exercise.muscle_group
                          }{" "}
                          •{" "}
                          {
                            exercise.equipment
                          }
                        </span>
                      </div>

                      <div className="actions">
                        <button
                          className="icon-btn"
                          onClick={() =>
                            setEditingExercise(
                              exercise
                            )
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="icon-btn danger"
                          onClick={() =>
                            deleteExercise(
                              exercise.id
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "workouts" && (
          <div className="workout-layout">
            <div className="panel">
              <div className="panel-title">
                <Plus />
                <h3>New Workout</h3>
              </div>

              <form onSubmit={createWorkout}>
                <input
                  placeholder="Workout name"
                  value={workoutName}
                  onChange={(e) =>
                    setWorkoutName(
                      e.target.value
                    )
                  }
                  required
                />

                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) =>
                    setWorkoutDate(
                      e.target.value
                    )
                  }
                  required
                />

                <button className="primary-btn">
                  Create Workout
                </button>
              </form>

              <hr />

              <h3>Workout History</h3>

              <div className="workout-history">
                {workouts.map((workout) => (
                  <div
                    className={`history-item ${selectedWorkout?.id ===
                      workout.id
                      ? "selected"
                      : ""
                      }`}
                    key={workout.id}
                    onClick={() =>
                      refreshSelectedWorkout(
                        workout.id
                      )
                    }
                  >
                    <div>
                      <strong>
                        {workout.name}
                      </strong>
                      <span>
                        {
                          workout.workout_date
                        }
                      </span>
                    </div>

                    <button
                      className="icon-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkout(
                          workout.id
                        );
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel wide">
              {!selectedWorkout ? (
                <Empty text="Select a workout to manage exercises and sets." />
              ) : (
                <>
                  <div className="workout-heading">
                    <div>
                      <span className="eyebrow">
                        WORKOUT
                      </span>
                      <h2>
                        {
                          selectedWorkout.name
                        }
                      </h2>
                      <p>
                        {
                          selectedWorkout.workout_date
                        }
                      </p>
                    </div>
                  </div>

                  <div className="add-exercise-row">
                    <select
                      value={
                        selectedExerciseId
                      }
                      onChange={(e) =>
                        setSelectedExerciseId(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select exercise
                      </option>

                      {exercises.map(
                        (exercise) => (
                          <option
                            key={
                              exercise.id
                            }
                            value={
                              exercise.id
                            }
                          >
                            {
                              exercise.name
                            }
                          </option>
                        )
                      )}
                    </select>

                    <button
                      className="primary-btn"
                      onClick={
                        addExerciseToWorkout
                      }
                    >
                      <Plus size={18} />
                      Add Exercise
                    </button>
                  </div>

                  <div className="workout-exercises">
                    {selectedWorkout
                      .workout_exercises
                      ?.length === 0 ? (
                      <Empty text="Add an exercise to start logging sets." />
                    ) : (
                      selectedWorkout.workout_exercises?.map(
                        (we) => (
                          <div
                            className="workout-exercise"
                            key={we.id}
                          >
                            <div className="exercise-heading">
                              <div>
                                <h3>
                                  {
                                    we
                                      .exercises
                                      ?.name
                                  }
                                </h3>

                                <span>
                                  {
                                    we
                                      .exercises
                                      ?.muscle_group
                                  }
                                </span>
                              </div>
                            </div>

                            <div className="set-form">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Weight kg"
                                value={
                                  setWeight
                                }
                                onChange={(
                                  e
                                ) =>
                                  setSetWeight(
                                    e
                                      .target
                                      .value
                                  )
                                }
                              />

                              <input
                                type="number"
                                min="1"
                                placeholder="Reps"
                                value={
                                  setReps
                                }
                                onChange={(
                                  e
                                ) =>
                                  setSetReps(
                                    e
                                      .target
                                      .value
                                  )
                                }
                              />

                              <button
                                className="primary-btn"
                                onClick={() =>
                                  addSet(
                                    we.id
                                  )
                                }
                              >
                                <Plus
                                  size={
                                    16
                                  }
                                />
                                Add Set
                              </button>
                            </div>

                            <div className="sets">
                              {we.sets?.map(
                                (
                                  set,
                                  index
                                ) => (
                                  <div
                                    className="set-row"
                                    key={
                                      set.id
                                    }
                                  >
                                    <span>
                                      Set{" "}
                                      {index +
                                        1}
                                    </span>

                                    <strong>
                                      {
                                        set.weight
                                      }{" "}
                                      kg
                                    </strong>

                                    <strong>
                                      {
                                        set.reps
                                      }{" "}
                                      reps
                                    </strong>

                                    <div className="actions">
                                      <button
                                        className="icon-btn"
                                        onClick={() =>
                                          editSet(
                                            set
                                          )
                                        }
                                      >
                                        <Pencil
                                          size={
                                            15
                                          }
                                        />
                                      </button>

                                      <button
                                        className="icon-btn danger"
                                        onClick={() =>
                                          deleteSet(
                                            set.id
                                          )
                                        }
                                      >
                                        <Trash2
                                          size={
                                            15
                                          }
                                        />
                                      </button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "progress" && (
          <div className="progress-page">
            <div className="panel">
              <div className="panel-title">
                <TrendingUp />
                <h3>Exercise Progress</h3>
              </div>

              <div className="progress-selector">
                <select
                  value={
                    selectedProgressExercise
                  }
                  onChange={(e) =>
                    setSelectedProgressExercise(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select exercise
                  </option>

                  {exercises.map((exercise) => (
                    <option
                      key={exercise.id}
                      value={exercise.id}
                    >
                      {exercise.name}
                    </option>
                  ))}
                </select>

                <button
                  className="primary-btn"
                  onClick={loadProgress}
                >
                  Analyze Progress
                </button>
              </div>
            </div>

            {progress &&
              progress.currentSession && (
                <>
                  <div className="stats-grid">
                    <StatCard
                      icon={<Dumbbell />}
                      title="Best Weight"
                      value={`${progress.bestWeight} kg`}
                    />

                    <StatCard
                      icon={<ClipboardList />}
                      title="Best Reps"
                      value={progress.bestReps}
                    />

                    <StatCard
                      icon={<TrendingUp />}
                      title="Estimated 1RM"
                      value={`${progress.currentSession.estimated1RM} kg`}
                    />

                    <StatCard
                      icon={<Flame />}
                      title="Status"
                      value={progress.status}
                    />
                  </div>

                  <div className="comparison-grid">
                    <ProgressCard
                      title="Previous Session"
                      session={
                        progress.previousSession
                      }
                    />

                    <ProgressCard
                      title="Current Session"
                      session={
                        progress.currentSession
                      }
                    />
                  </div>
                </>
              )}
          </div>
        )}

        {tab === "streak" && (
          <div className="streak-page">
            <div className="streak-hero panel">
              <Flame size={58} />

              <h2>
                {streak?.currentStreak || 0} Day
                Streak
              </h2>

              <p>
                Keep showing up and build your
                consistency.
              </p>
            </div>

            <div className="stats-grid">
              <StatCard
                icon={<Flame />}
                title="Current Streak"
                value={
                  streak?.currentStreak || 0
                }
              />

              <StatCard
                icon={<TrendingUp />}
                title="Longest Streak"
                value={
                  streak?.longestStreak || 0
                }
              />
            </div>
          </div>
        )}
      </section>

      {editingExercise && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Exercise</h2>

              <button
                className="icon-btn"
                onClick={() =>
                  setEditingExercise(null)
                }
              >
                <X />
              </button>
            </div>

            <input
              value={editingExercise.name}
              onChange={(e) =>
                setEditingExercise({
                  ...editingExercise,
                  name: e.target.value
                })
              }
            />

            <input
              value={
                editingExercise.muscle_group
              }
              onChange={(e) =>
                setEditingExercise({
                  ...editingExercise,
                  muscle_group: e.target.value
                })
              }
            />

            <input
              value={editingExercise.equipment}
              onChange={(e) =>
                setEditingExercise({
                  ...editingExercise,
                  equipment: e.target.value
                })
              }
            />

            <button
              className="primary-btn full"
              onClick={updateExercise}
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({
  icon,
  title,
  value
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}

function ProgressCard({
  title,
  session
}: {
  title: string;
  session: Progress["previousSession"] | Progress["currentSession"];
}) {
  return (
    <div className="panel">
      <h3>{title}</h3>

      {!session ? (
        <Empty text="No previous session available." />
      ) : (
        <div className="progress-details">
          <div>
            <span>Workout</span>
            <strong>{session.workoutName}</strong>
          </div>

          <div>
            <span>Date</span>
            <strong>{session.workoutDate}</strong>
          </div>

          <div>
            <span>Best Weight</span>
            <strong>
              {session.bestWeight} kg
            </strong>
          </div>

          <div>
            <span>Best Reps</span>
            <strong>{session.bestReps}</strong>
          </div>

          <div>
            <span>Estimated 1RM</span>
            <strong>
              {session.estimated1RM} kg
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="feature-card"
      onClick={onClick}
    >
      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <div className="feature-arrow">
        →
      </div>
    </button>
  );
}

function Step({
  number,
  title,
  text
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="step-card">

      <span className="step-number">
        {number}
      </span>

      <h3>{title}</h3>

      <p>{text}</p>

    </div>
  );
}