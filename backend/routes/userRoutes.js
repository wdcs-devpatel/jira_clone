const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const userController = require("../controllers/userController");

/* =====================================================
   ADMIN ROUTES
===================================================== */

// 🔥 Only Admin can list all users
router.get(
  "/",
  auth,
  requireRole("Admin"),
  userController.getUsers
);

// 🔥 Only Admin can change user roles
router.put(
  "/:userId/role",
  auth,
  requireRole("Admin"),
  userController.updateUserRole
);

/* =====================================================
   USER PROFILE ROUTES
===================================================== */

// Any authenticated user can view own profile
router.get(
  "/profile",
  auth,
  userController.getProfile
);

// Any authenticated user can update own profile
router.put(
  "/profile",
  auth,
  userController.updateProfile
);

module.exports = router;