const jwt = require("jsonwebtoken");
const { CONFIG } = require("../config/db");
const { User, Role, Permission } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);

    // 🔥 Fetch user WITH fresh permissions
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Role,
        include: {
          model: Permission,
          through: { attributes: [] }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const permissions =
      user.Role?.Permissions?.map(p => p.name) || [];

    // 🔥 Attach everything to req.user
    req.user = {
      id: user.id,
      role: user.Role?.name,
      permissions
    };

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};