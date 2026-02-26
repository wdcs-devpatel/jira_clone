module.exports = (permission) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

 
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: `Forbidden: Missing required permission [${permission}]` 
      });
    }

    next();
  };
};