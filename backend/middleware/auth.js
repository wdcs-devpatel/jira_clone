module.exports = (req, res, next) => {
  try {
    const userHeader = req.headers["x-user"];

    if (!userHeader) {
      return res.status(401).json({ message: "Not authenticated. No user header found." });
    }

    // Safely parse the user string
    req.user = JSON.parse(userHeader);
    
    // Ensure the user object has an ID before proceeding
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Invalid user data in header." });
    }

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Invalid authentication format." });
  }
};