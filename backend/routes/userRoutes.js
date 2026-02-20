const router = require("express").Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

router.get("/", auth, userController.getUsers);

router.get("/profile", auth, userController.getProfile); // Fetch profile
router.put("/profile", auth, userController.updateProfile); // Update profile

module.exports = router;