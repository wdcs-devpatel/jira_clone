const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");

// ✅ Protect the user list with the 'view_users' permission string
router.get("/", auth, requirePermission("view_users"), userController.getUsers);

// ✅ Profile routes
router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);

// ✅ Admin only: Role management
router.put("/:userId/role", auth, requirePermission("view_users"), userController.updateUserRole);

module.exports = router;