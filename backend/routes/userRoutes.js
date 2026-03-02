const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission"); // ✅ Added import

// 1. Profile Management
// Fetches the logged-in user's own data
router.get("/profile", auth, userController.getProfile);

// Updates the logged-in user's own data
router.put("/profile", auth, userController.updateProfile);

// 2. Administrative Personnel Management
// ✅ Protected by 'view_users' permission
// If a role does not have this permission, the API will return 403 Forbidden
router.get("/", auth, requirePermission("view_users"), userController.getUsers);

// 3. Role Assignment
// Updates a specific user's system rank/role
router.put("/:userId/role", auth, userController.updateUserRole);

module.exports = router;