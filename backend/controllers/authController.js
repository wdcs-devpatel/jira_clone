const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios"); 
const { Op } = require("sequelize");
const { CONFIG } = require("../config/db");
const { User, Role, Permission } = require("../models");

const MONGO_SERVICE_URL = process.env.MONGO_SERVICE_URL || "http://localhost:5001/api/viewer";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, CONFIG.JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ id: userId }, CONFIG.JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

/* =============================================================
   USER LOGIN
   ============================================================= */
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

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    // ✅ Step 2: CHECK VIEWER STATUS VIA INTERNAL API CALL
    let isViewer = false;
    try {
      const viewerRes = await axios.get(`${MONGO_SERVICE_URL}/check/${user.id}`, { timeout: 2000 });
      isViewer = viewerRes.data.isViewer;
    } catch (apiErr) {
      console.error("⚠️ Mongo Service unreachable or timed out. Falling back to SQL roles.", apiErr.message);
    }

    let permissions = user.Role?.Permissions?.map(p => p.name) || [];
    let roleData = user.Role;

    if (isViewer) {
        permissions = ["view_dashboard", "view_task"];
      roleData = {
        id: "viewer",
        name: "Viewer"
      };
    }

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        Role: roleData,
        permissions 
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =============================================================
   GET CURRENT PROFILE
   ============================================================= */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Role,
        include: { model: Permission, through: { attributes: [] } }
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Step 4: Apply the same API check for Profile refresh
    let isViewer = false;
    try {
      const viewerRes = await axios.get(`${MONGO_SERVICE_URL}/check/${user.id}`);
      isViewer = viewerRes.data.isViewer;
    } catch (apiErr) {
      console.error("⚠️ Mongo Service unreachable during profile fetch.");
    }

    let permissions = user.Role?.Permissions?.map(p => p.name) || [];
    let roleData = user.Role;

    if (isViewer) {
      permissions = ["view_dashboard", "view_task"];
      roleData = {
        id: "viewer",
        name: "Viewer"
      };
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      Role: roleData,
      permissions
    });
  } catch (err) {
    next(err);
  }
};

/* =============================================================
   REFRESH TOKEN
   ============================================================= */
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, CONFIG.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Invalid session" });

    if (!user.isActive) return res.status(403).json({ message: "Account deactivated" });

    const tokens = generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch (err) {
    return res.status(403).json({ message: "Session expired" });
  }
};

/* =============================================================
   USER REGISTRATION
   ============================================================= */
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
      role_id: assignedRole.id,
      isActive: true 
    });

    res.status(201).json({ message: "Registered", user: { id: user.id, username, role: roleName } });
  } catch (err) {
    next(err);
  }
};

/* =============================================================
   LOGOUT
   ============================================================= */
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