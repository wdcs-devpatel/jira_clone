const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

// ROUTES
const attachmentRoutes = require("./routes/attachmentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const timeLogRoutes = require("./routes/timeLogRoutes");
const backlogRoutes = require("./routes/backlogRoutes");
const companyRoutes = require("./routes/companyRoutes");

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

/*
=================================
MIDDLEWARE
=================================
*/
app.use(cors());
app.use(express.json());

/*
=================================
STATIC FILES
=================================
*/
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
=================================
API ROUTES
=================================
*/
app.use("/api/backlogs", backlogRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/timelog", timeLogRoutes);
app.use("/api/companies", companyRoutes);

/*
=================================
HEALTH CHECK
=================================
*/
app.get("/", (req, res) => {
  res.send("Jira Clone MongoDB Microservice Running 🚀");
});

/*
=================================
START SERVER
=================================
*/
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Mongo Microservice running on port ${PORT}`);
});