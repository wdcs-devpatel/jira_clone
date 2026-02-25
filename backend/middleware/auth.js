const jwt = require("jsonwebtoken");
const { CONFIG } = require("../config/db");
const { User, Role, Permission } = require("../models");

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token provided" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Role,
        include: {
          model: Permission,
          through: { attributes: [] } // Clean junction table data
        }
      }
    });

    if (!user) return res.status(401).json({ message: "User no longer exists" });

    // 🔥 Flatten permissions into a simple array of strings for easy checking
    req.user = {
      id: user.id,
      role: user.Role?.name,
      permissions: user.Role?.Permissions?.map(p => p.name) || []
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};