const { supabase, createUserClient } = require("../db/supabase");

const authMiddleware = async (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer "))
            return res.status(401).json({ error: "Authentication required" });

        const token = header.split(" ")[1];

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user)
            return res.status(401).json({ error: "Invalid or expired token" });

        req.user = data.user;
        req.supabase = createUserClient(token);

        next();
    } catch (err) {
        res.status(401).json({ error: "Authentication failed" });
    }
};

module.exports = authMiddleware;