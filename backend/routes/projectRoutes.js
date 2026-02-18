const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); 
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

router.use(auth);

router.route("/")
  .get(getProjects)
  .post(createProject);

router.route("/:id")
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;