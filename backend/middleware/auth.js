const jwt = require("jsonwebtoken");
const { CONFIG } = require("../config/db");
const { User, Role, Permission } = require("../models");

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token provided" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    
    // ✅ Use a lean fetch. Ensure models are mapped to 'Users' and 'Roles' in pgAdmin
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Role,
        include: {
          model: Permission,
          through: { attributes: [] } 
        }
      }
    });

    if (!user) return res.status(401).json({ message: "User no longer exists" });

    // ✅ Attach data for downstream permission/role checks
    req.user = {
      id: user.id,
      role: user.Role?.name, // Matches 'Admin', 'Dev', etc. in pgAdmin Roles table
      permissions: user.Role?.Permissions?.map(p => p.name) || [] // e.g., ["view_users"]
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};