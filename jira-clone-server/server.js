const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import Routes
const attachmentRoutes = require("./routes/attachmentRoutes");
const activityRoutes = require("./routes/activityRoutes");

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files - Serves physical files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route Registration
app.use("/api/attachments", attachmentRoutes);
app.use("/api/activity", activityRoutes);

app.get("/", (req, res) => {
  res.send("Jira Clone - MongoDB Attachment & Activity Microservice Running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Attachment & Activity Service running on port ${PORT}`);
});