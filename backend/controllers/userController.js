const User = require("../models/User");

// GET ALL USERS
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "firstName", "lastName", "phone"],
    });

    // Map results to include a 'name' field that the frontend expects
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

// GET PROFILE
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "firstName", "lastName", "phone"]
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const u = user.toJSON();
    u.name = (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` : u.username;
    
    res.json(u);
  } catch (err) {
    next(err);
  }
};

// UPDATE PROFILE
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
    // Ensure 'name' is present in the update response too
    responseData.name = (responseData.firstName && responseData.lastName) 
      ? `${responseData.firstName} ${responseData.lastName}` 
      : responseData.username;

    res.json(responseData);
  } catch (err) {
    next(err);
  }
};