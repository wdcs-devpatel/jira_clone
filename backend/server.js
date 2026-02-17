const express = require("express");
const cors = require("cors");

const { PORT } = require("./config/env.config");
const { connectDB } = require("./config/db");
const { sequelize } = require("./models");

const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ERROR HANDLER */
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    console.log("Database synced");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Server start failed:", err);
  }
};

startServer();
