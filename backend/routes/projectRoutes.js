const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); 

const projectController = require("../controllers/projectController");

router.use(auth);

/* BASE PROJECT ROUTES */
router.route("/")
  .get(projectController.getProjects)
  .post(projectController.createProject);

router.route("/:id")
  .get(projectController.getProject)
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);


/* TEAM MEMBER ROUTES */
router.get("/:id/members", projectController.getMembers);
router.post("/:id/members", projectController.addMember);

// NEW: Delete member route
router.delete("/:id/members/:userId", projectController.removeMember);

module.exports = router;