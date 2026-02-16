const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const { sequelize } = require("./models");

const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json()); // ✅ REQUIRED: Parses JSON bodies so req.body is not undefined

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ERROR MIDDLEWARE */
app.use(errorHandler);

const PORT = 5000;

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync(); 
    console.log("Database synced successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server start error:", err);
  }
};

startServer();