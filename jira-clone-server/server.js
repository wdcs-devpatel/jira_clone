const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// RabbitMQ Imports
const { connectRabbitMQ } = require("./rabbitmq/connection");
const startActivityConsumer = require("./rabbitmq/activityConsumer");
const startTimeLogConsumer = require("./rabbitmq/timeConsumer");

/* =================================
1️⃣ CONFIGURATION & DB
================================= */
dotenv.config();
connectDB();

/* =================================
2️⃣ APP INITIALIZATION
================================= */
const app = express();

/* =================================
3️⃣ GLOBAL MIDDLEWARE
================================= */
app.use(cors());
app.use(express.json());

/* =================================
4️⃣ IMPORT ROUTES
================================= */
const viewerRoutes = require("./routes/viewerRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const timeLogRoutes = require("./routes/timeLogRoutes");
const backlogRoutes = require("./routes/backlogRoutes");
const companyRoutes = require("./routes/companyRoutes");

/* =================================
5️⃣ STATIC FILES
================================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =================================
6️⃣ REGISTER API ROUTES
================================= */

// Viewer RBAC microservice
app.use("/api/viewer", viewerRoutes);

// Other microservice routes
app.use("/api/backlogs", backlogRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/timelog", timeLogRoutes);
app.use("/api/companies", companyRoutes);

/* =================================
7️⃣ HEALTH CHECK
================================= */
app.get("/", (req, res) => {
  res.json({
    service: "Mongo RBAC Microservice",
    status: "running",
    port: process.env.PORT || 5001
  });
});

/* =================================
8️⃣ GLOBAL ERROR HANDLER
================================= */
app.use((err, req, res, next) => {
  console.error("Mongo Service Error:", err);
  res.status(500).json({
    message: "Internal Mongo Service Error",
    error: err.message
  });
});

/* =================================
9️⃣ START SERVER & RABBITMQ
================================= */
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Initialize RabbitMQ
    await connectRabbitMQ();

    // Start background consumers
    startActivityConsumer();
    startTimeLogConsumer();

    app.listen(PORT, () => {
      console.log(`🚀 Mongo Microservice running on port ${PORT}`);
      console.log(`🐰 RabbitMQ Consumers connected and listening`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize microservice:", error);
    process.exit(1);
  }
};

startServer();