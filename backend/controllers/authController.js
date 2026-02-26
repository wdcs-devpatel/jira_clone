const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { CONFIG } = require("../config/db");
const { User, Role, Permission } = require("../models");

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, CONFIG.JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ id: userId }, CONFIG.JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, phone, position } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const roleName = position || "Dev";
    const assignedRole = await Role.findOne({ where: { name: roleName } });

    if (!assignedRole) return res.status(500).json({ message: "Role assignment failed" });

    const user = await User.create({
      username,
      email,
      password: hash,
      firstName,
      lastName,
      phone,
      role_id: assignedRole.id
    });

    res.status(201).json({ message: "Registered", user: { id: user.id, username, role: roleName } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      where: { [Op.or]: [{ email: identifier }, { username: identifier }] },
      include: {
        model: Role,
        include: { model: Permission, through: { attributes: [] } } 
      }
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    // ✅ Flatten permissions array for frontend UI gating
    const permissions = user.Role?.Permissions?.map(p => p.name) || [];

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        Role: user.Role,
        permissions // e.g., ["view_users", "create_task"]
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, CONFIG.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Invalid session" });

    const tokens = generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch (err) {
    return res.status(403).json({ message: "Session expired" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};    