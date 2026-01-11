require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(routes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Strava Dashboard API is running!" });
});

// Start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected");

    // Sync database (create tables if not exist)
    await sequelize.sync();
    console.log("✅ Database synced");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ DB error:", err);
  }
})();
