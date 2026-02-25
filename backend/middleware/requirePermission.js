module.exports = (permission) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    // 🔥 This is where your 403 error is generated if the permission string 
    // doesn't match the database exactly (e.g., 'view_users' vs 'ViewUsers')
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: `Forbidden: Missing required permission [${permission}]` 
      });
    }

    next();
  };
};