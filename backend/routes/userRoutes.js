const router = require("express").Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

// Get list of users
router.get("/", auth, userController.getUsers);

// Profile routes
router.get("/profile", auth, userController.getProfile); // Fetch profile
router.put("/profile", auth, userController.updateProfile); // Update profile

module.exports = router;