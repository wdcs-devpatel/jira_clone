const express = require("express");
const cors = require("cors");

const { connectDB, CONFIG } = require("./config/db");
const { sequelize } = require("./models");

// Routes
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ERROR HANDLER */
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    // IMPORTANT → alter:true keeps schema synced
    await sequelize.sync({ alter: true });

    console.log("Database synced");

    app.listen(CONFIG.PORT, () => {
      console.log(`Server running on port ${CONFIG.PORT}`);
    });

  } catch (err) {
    console.error("Server start failed:", err);
    process.exit(1);
  }
};

startServer();
