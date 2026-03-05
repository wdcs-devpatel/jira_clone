const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
// ✅ Removed taskRoutes
const attachmentRoutes = require("./routes/attachmentRoutes");

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serves physical files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ NEW: Specialized Attachment Route
app.use("/api/attachments", attachmentRoutes);

app.get("/", (req, res) => {
  res.send("Jira Clone - MongoDB Attachment Microservice Running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Attachment Service running on port ${PORT}`);
});