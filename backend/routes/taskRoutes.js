const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createTask,
  getTasksByProject,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/taskController");

router.use(auth);

router.post("/project/:projectId", createTask);
router.get("/project/:projectId", getTasksByProject);
router.put("/:id", updateTask);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

module.exports = router;
