const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Op } = require("sequelize");
const { CONFIG } = require("../config/db");

/* =====================================================
   HELPER — GENERATE TOKENS
===================================================== */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    CONFIG.JWT_SECRET,
    { expiresIn: "15m" } // Increased slightly from 2m for better UX during dev
  );

  const refreshToken = jwt.sign(
    { id: userId },
    CONFIG.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

/* =====================================================
   REGISTER
===================================================== */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, phone, position } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hash,
      firstName,
      lastName,
      phone,
      position // Ensure position is saved on registration
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        position: user.position
      }
    });

  } catch (err) {
    next(err);
  }
};

/* =====================================================
   LOGIN
===================================================== */
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // DEBUG LOGS - Remove after fixing
    console.log("LOGIN ATTEMPT - Identifier:", identifier);

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) {
      console.log("LOGIN FAIL: User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("LOGIN FAIL: Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* Generate tokens */
    const { accessToken, refreshToken } = generateTokens(user.id);

    /* Save refresh token */
    user.refreshToken = refreshToken;
    await user.save();

    console.log("LOGIN SUCCESS:", user.username);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        position: user.position // Crucial for your Profile dropdown logic
      },
      accessToken,
      refreshToken
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    next(err);
  }
};

/* =====================================================
   REFRESH TOKEN (ROTATION)
===================================================== */
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)  
    return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = jwt.verify(refreshToken, CONFIG.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Invalid refresh token" });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

/* =====================================================
   LOGOUT
===================================================== */
exports.logout = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId)
      return res.status(400).json({ message: "User ID required" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.refreshToken = null;
    await user.save();

    res.json({ message: "Logged out successfully" });

  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};