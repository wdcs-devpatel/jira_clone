// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// ✅ 1. Add the Profile Fetch route (Fixes Profile.tsx fetch error)
router.get("/profile", auth, userController.getProfile);

// ✅ 2. Add the Profile Update route (Fixes handleSave 404 error)
router.put("/profile", auth, userController.updateProfile);

// ✅ 3. Ensure the base User List route exists (Fixes Admin Panel 404)
router.get("/", auth, userController.getUsers);

// Existing role update route
router.put("/:userId/role", auth, userController.updateUserRole);

module.exports = router;