const { User, Role } = require("../models");

/* =====================================================
   GET ALL USERS (Admin Only)
===================================================== */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: {
        model: Role,
        attributes: ["id", "name"]
      },
      attributes: ["id", "username", "email", "firstName", "lastName", "phone"]
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET PROFILE (Authenticated User)
===================================================== */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Role,
        attributes: ["id", "name"]
      },
      attributes: ["id", "username", "email", "firstName", "lastName", "phone"]
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   UPDATE PROFILE (Authenticated User)
===================================================== */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, firstName, lastName, phone } = req.body;

    const user = await User.findByPk(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    await user.update({
      username: username ?? user.username,
      email: email ?? user.email,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      phone: phone ?? user.phone,
    });

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    next(err);
  }
};

/* =====================================================
   UPDATE USER ROLE (Admin Only)
===================================================== */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    const user = await User.findByPk(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.role_id = roleId;
    await user.save();

    res.json({ message: "User role updated successfully" });

  } catch (err) {
    next(err);
  }
};