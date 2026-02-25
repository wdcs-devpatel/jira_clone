module.exports = (roleName) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    if (req.user.role !== roleName)
      return res.status(403).json({ message: "Forbidden: Role required" });

    next();
  };
};