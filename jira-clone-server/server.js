const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔥 Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/tasks", taskRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("MongoDB Atlas Server Running...");
});

// Port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});