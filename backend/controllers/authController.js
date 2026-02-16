const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { Op } = require("sequelize"); // FIXED: Proper import for Op

/* REGISTER */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hash
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email
    });

  } catch (err) { next(err); }
};

/* LOGIN */
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [ // FIXED: Cleaner Op usage
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);

    if (!ok)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken: `token-${user.id}`
    });

  } catch (err) { next(err); }
};