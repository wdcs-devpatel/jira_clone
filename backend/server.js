const express = require("express");
const cors = require("cors");
const { connectDB, CONFIG } = require("./config/db");
const { sequelize } = require("./models");
const initializeRBAC = require("./seeders/initRBAC"); // 🔥 Import Seeder

const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");

const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync(); 
    await initializeRBAC(); // 🔥 Run Seeder after sync
    console.log("Database synced & RBAC Initialized");

    app.listen(CONFIG.PORT, () => {
      console.log(`Server running on port ${CONFIG.PORT}`);
    });
  } catch (err) {
    console.error("Server start failed:", err);
    process.exit(1);
  }
};

startServer();