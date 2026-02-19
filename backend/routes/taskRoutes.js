const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  createTask,
  getTasksForProject,
  updateTask,
  updateTaskStatus,
  deleteTask,
  searchTasks
} = require("../controllers/taskController");

router.use(auth);

/* SEARCH MUST BE BEFORE /:id */
router.get("/search", searchTasks);

router.post("/project/:projectId", createTask);
router.get("/project/:projectId", getTasksForProject);
router.put("/:id", updateTask);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

module.exports = router;
