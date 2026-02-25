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

// ✅ Ensure all routes are authenticated
router.use(auth);

/* ==============================
   SEARCH & LIST ROUTES
============================== */

// Search must be defined before specific ID routes
router.get("/search", searchTasks);

// Get tasks associated with a specific project
router.get("/project/:projectId", getTasksForProject);

/* ==============================
   ACTION ROUTES (CRUD)
============================== */

// Create: Requires 'create_task' permission
router.post("/project/:projectId", requirePermission("create_task"), createTask);

// Update: Requires 'edit_task' permission. Note use of ':id'
router.put("/:id", requirePermission("edit_task"), updateTask);

// Status Patch: Specific for Kanban Drag & Drop
router.patch("/:id/status", updateTaskStatus); 

// Delete: Requires 'delete_task' permission
router.delete("/:id", requirePermission("delete_task"), deleteTask);

module.exports = router;