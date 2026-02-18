const router = require("express").Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

// Get list of users (for dropdowns/mentions)
router.get("/", auth, userController.getUsers);

// Update own profile
router.put("/profile", auth, userController.updateProfile);

module.exports = router;