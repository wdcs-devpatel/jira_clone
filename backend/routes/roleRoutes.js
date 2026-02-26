const router = require("express").Router();

const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const roleController = require("../controllers/roleController");

/* =====================================================
   ROLE MANAGEMENT ROUTES
   Permission-Based RBAC (Correct Architecture)
===================================================== */

/**
 * GET ALL ROLES WITH PERMISSIONS
 * Requires: view_admin_panel
 */
router.get(
  "/",
  auth,
  requirePermission("view_admin_panel"),
  roleController.getRoles
);

/**
 * UPDATE ROLE PERMISSIONS
 * Requires: view_admin_panel
 */
router.put(
  "/:roleId/permissions",
  auth,
  requirePermission("view_admin_panel"),
  roleController.updateRolePermissions
);

module.exports = router;