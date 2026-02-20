const User = require("../models/User");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "firstName", "lastName", "phone", "position"],
    });

    const formattedUsers = users.map(user => {
      const u = user.toJSON();
      u.name = (u.firstName && u.lastName) 
        ? `${u.firstName} ${u.lastName}` 
        : u.username;
      return u;
    });

    res.json(formattedUsers);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "firstName", "lastName", "phone", "position"]
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const u = user.toJSON();
    u.name = (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` : u.username;
    
    res.json(u);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, firstName, lastName, phone, position } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({
      username: username ?? user.username,
      email: email ?? user.email,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      phone: phone ?? user.phone,
      position: position ?? user.position,
    });

    const responseData = user.toJSON();
    delete responseData.password;
    responseData.name = (responseData.firstName && responseData.lastName) 
      ? `${responseData.firstName} ${responseData.lastName}` 
      : responseData.username;

    res.json(responseData);
  } catch (err) {
    next(err);
  }
};