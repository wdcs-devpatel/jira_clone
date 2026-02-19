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
    { expiresIn: "15s" }
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
    const { username, email, password, firstName, lastName, phone } = req.body;

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
      phone
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
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

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    /* Generate tokens */
    const { accessToken, refreshToken } = generateTokens(user.id);

    /* Save refresh token */
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      accessToken,
      refreshToken
    });

  } catch (err) {
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
    /* verify refresh token */
    const decoded = jwt.verify(refreshToken, CONFIG.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Invalid refresh token" });

    /* Generate new tokens */
    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(user.id);

    /* rotate refresh token */
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
