const jwt = require("jsonwebtoken");
const { CONFIG } = require("../config/db");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ message: "No token provided" });

  const token = header.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Invalid token format" });

  try {
    // verify normally
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {

    // allow expired token ONLY for refresh endpoint
    if (req.originalUrl.includes("/refresh")) {
      const decoded = jwt.decode(token);
      if (!decoded)
        return res.status(401).json({ message: "Invalid token" });

      req.user = decoded;
      return next();
    }

    return res.status(401).json({ message: "Token expired or invalid" });
  }
};
