const getExercises = async (req, res) => {
    const { data, error } = await req.supabase
        .from("exercises")
        .select("*")
        .order("created_at", { ascending: false });

    if (error)
        return res.status(500).json({ error: error.message });

    res.json(data);
};

const addExercise = async (req, res) => {
    const { name, muscle_group, equipment } = req.body;

    if (!name || !muscle_group || !equipment)
        return res.status(400).json({ error: "All fields are required" });

    const { data, error } = await req.supabase
        .from("exercises")
        .insert({
            user_id: req.user.id,
            name,
            muscle_group,
            equipment
        })
        .select()
        .single();

    if (error)
        return res.status(400).json({ error: error.message });

    res.status(201).json(data);
};

const updateExercise = async (req, res) => {
    const { id } = req.params;
    const { name, muscle_group, equipment } = req.body;

    const { data, error } = await req.supabase
        .from("exercises")
        .update({ name, muscle_group, equipment })
        .eq("id", id)
        .select()
        .single();

    if (error)
        return res.status(400).json({ error: error.message });

    res.json(data);
};

const deleteExercise = async (req, res) => {
    const { id } = req.params;

    const { error } = await req.supabase
        .from("exercises")
        .delete()
        .eq("id", id);

    if (error)
        return res.status(400).json({ error: error.message });

    res.json({ message: "Exercise deleted successfully" });
};

module.exports = {
    getExercises,
    addExercise,
    updateExercise,
    deleteExercise
};