const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");
const { sequelize } = require("./models");

const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/* ROUTES */
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = 5000;

const startServer = async () => {
  try {
    await connectDB();

    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Server start error:", err);
  }
};

startServer();
