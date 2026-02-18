const User = require("../models/User");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "firstName", "lastName", "phone"],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "firstName", "lastName", "phone"]
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, firstName, lastName, phone } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({
      username: username ?? user.username,
      email: email ?? user.email,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      phone: phone ?? user.phone,
    });

    const responseData = user.toJSON();
    delete responseData.password;
    res.json(responseData);
  } catch (err) {
    next(err);
  }
};