const jwt = require("jsonwebtoken");
const { Admin, User, UserLog } = require("../models");
const { Op } = require("sequelize");

const JWT_SECRET = process.env.JWT_SECRET || "strava_dashboard_secret_key_2024";

// Register admin
const register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validations
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        // Check if username or email exists
        const existingAdmin = await Admin.findOne({
            where: {
                [Op.or]: [{ username }, { email }],
            },
        });

        if (existingAdmin) {
            return res.status(400).json({ error: "Username or email already exists" });
        }

        // Create admin
        const admin = await Admin.create({ username, email, password });

        // Generate token
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: "admin" },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(201).json({
            message: "Admin registered successfully",
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
            },
            token,
        });
    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({ error: "Registration failed" });
    }
};

// Login admin
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Find admin
        const admin = await Admin.findOne({ where: { username } });
        if (!admin) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate token
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: "admin" },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login successful",
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
            },
            token,
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: "Login failed" });
    }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "strava_id", "name", "city", "country", "createdAt"],
            order: [["createdAt", "DESC"]],
        });

        res.json(users);
    } catch (error) {
        console.error("Get users error:", error.message);
        res.status(500).json({ error: "Failed to get users" });
    }
};

// Get user activity logs (admin only)
const getUserLogs = async (req, res) => {
    try {
        const { userId } = req.params;

        const where = {};
        if (userId) {
            where.user_id = userId;
        }

        const logs = await UserLog.findAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: 100,
        });

        res.json(logs);
    } catch (error) {
        console.error("Get logs error:", error.message);
        res.status(500).json({ error: "Failed to get logs" });
    }
};

// Get dashboard stats (admin only)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalLogs = await UserLog.count();

        // Logs per action type
        const logsPerAction = await UserLog.findAll({
            attributes: [
                "action",
                [require("sequelize").fn("COUNT", require("sequelize").col("action")), "count"],
            ],
            group: ["action"],
        });

        // Recent activity
        const recentLogs = await UserLog.findAll({
            order: [["createdAt", "DESC"]],
            limit: 10,
        });

        // Most active users
        const activeUsers = await UserLog.findAll({
            attributes: [
                "user_id",
                "user_name",
                [require("sequelize").fn("COUNT", require("sequelize").col("user_id")), "activity_count"],
            ],
            group: ["user_id", "user_name"],
            order: [[require("sequelize").literal("activity_count"), "DESC"]],
            limit: 5,
        });

        res.json({
            totalUsers,
            totalLogs,
            logsPerAction,
            recentLogs,
            activeUsers,
        });
    } catch (error) {
        console.error("Get stats error:", error.message);
        res.status(500).json({ error: "Failed to get stats" });
    }
};

// Verify token middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = {
    register,
    login,
    getAllUsers,
    getUserLogs,
    getDashboardStats,
    verifyToken,
};
