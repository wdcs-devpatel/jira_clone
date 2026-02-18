const User = require("../models/User");

/* GET ALL USERS */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email"],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/* UPDATE LOGGED-IN USER PROFILE */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Extracted from JWT middleware

    const { username, email, firstName, lastName, phone } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if they are provided in the request body
    await user.update({
      username: username ?? user.username,
      email: email ?? user.email,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      phone: phone ?? user.phone,
    });

    // Remove password from response for security
    const responseData = user.toJSON();
    delete responseData.password;

    res.json(responseData);
  } catch (err) {
    next(err);
  }
};