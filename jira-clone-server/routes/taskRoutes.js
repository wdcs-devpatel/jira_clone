const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  getAllTasks,
  createTask,
  updateTaskStatus,
  addComment,
  updatePriority,
  uploadAttachment,
  getTaskById,
} = require("../controllers/taskController");

// ==============================
// BASE TASK ROUTES
// ==============================

// Order matters: Static routes (/) must come before dynamic routes (/:taskId)
router.get("/", getAllTasks);
router.post("/", createTask);

// ==============================
// TASK ACTION ROUTES
// ==============================

router.put("/:taskId/status", updateTaskStatus);
router.post("/:taskId/comment", addComment);
router.put("/:taskId/priority", updatePriority);
router.post("/:taskId/attachment", upload.single("file"), uploadAttachment);

// ==============================
// GET TASK BY ID (MUST BE LAST)
// ==============================

router.get("/:taskId", (req, res, next) => {
  const { taskId } = req.params;

  // Validation middleware to prevent CastError for invalid ObjectIds
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: "Invalid Task ID format" });
  }

  next();
}, getTaskById);

module.exports = router;