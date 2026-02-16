    module.exports = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header)
        return res.status(401).json({ message: "No token provided" });

    const token = header.split(" ")[1];

    if (!token)
        return res.status(401).json({ message: "Invalid token format" });

    // Fake decode logic (since you're using token-id format)
    if (!token.startsWith("token-"))
        return res.status(401).json({ message: "Invalid token" });

    const userId = token.split("-")[1];

    req.user = { id: Number(userId) };

    next();
    };
