const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");

const {
  createTask,
  getTasksForProject,
  updateTask,
  updateTaskStatus,
  deleteTask,
  searchTasks
} = require("../controllers/taskController");

// Global authentication for all task routes
router.use(auth);

/* SEARCH MUST BE BEFORE /:id */
router.get("/search", searchTasks);

// Permissions-based guards
router.post("/project/:projectId", requirePermission("create_task"), createTask);
router.get("/project/:projectId", getTasksForProject); // Usually viewable by project members
router.put("/:id", requirePermission("edit_task"), updateTask);
router.patch("/:id/status", updateTaskStatus); // Allowed for Devs to change status
router.delete("/:id", requirePermission("delete_task"), deleteTask);

module.exports = router;