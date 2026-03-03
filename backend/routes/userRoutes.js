const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");

/* =============================================================
   1. PROFILE MANAGEMENT (Self)
   ============================================================= */

// Fetches the logged-in user's own data
router.get("/profile", auth, userController.getProfile);

// Updates the logged-in user's own data
router.put("/profile", auth, userController.updateProfile);


/* =============================================================
   2. ADMINISTRATIVE PERSONNEL MANAGEMENT
   ============================================================= */

// GET ALL USERS: Protected by 'view_users' permission
router.get("/", auth, requirePermission("view_users"), userController.getUsers);

// ROLE ASSIGNMENT: Updates a specific user's system rank/role
router.put("/:userId/role", auth, requirePermission("manage_users"), userController.updateUserRole);

// ACTIVATE / DEACTIVATE: Toggle user account status
router.patch(
  "/:userId/status",
  auth,
  requirePermission("manage_users"),
  userController.toggleUserStatus
);

// DELETE USER: Permanently remove personnel from the system
router.delete(
  "/:userId",
  auth,
  requirePermission("manage_users"),
  userController.deleteUser
);

module.exports = router;