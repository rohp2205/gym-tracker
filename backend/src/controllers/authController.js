const { supabase } = require("../db/supabase");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ error: "All fields are required" });

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });

        if (error)
            return res.status(400).json({ error: error.message });

        res.status(201).json({
            message: "Registration successful",
            user: data.user,
            session: data.session
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: "Email and password are required" });

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error)
            return res.status(401).json({ error: error.message });

        res.json({
            message: "Login successful",
            user: data.user,
            token: data.session.access_token
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const me = async (req, res) => {
    res.json({
        message: "Authentication successful",
        user: req.user
    });
};

module.exports = { register, login, me };