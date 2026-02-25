const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const roleController = require("../controllers/roleController");

/* =====================================================
   ADMIN ONLY ROUTES
===================================================== */

router.get(
  "/",
  auth,
  requireRole("Admin"),
  roleController.getRoles
);

router.put(
  "/:roleId/permissions",
  auth,
  requireRole("Admin"),
  roleController.updateRolePermissions
);

module.exports = router;