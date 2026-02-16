const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Import middleware
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// Apply auth middleware to ALL routes in this file
router.use(auth);

router.route("/")
  .get(getProjects)
  .post(createProject);

router.route("/:id")
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;