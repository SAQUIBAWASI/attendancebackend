const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    // Check for x-auth-token or Authorization: Bearer token
    let token = req.headers["x-auth-token"] || req.headers["authorization"];

    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Decoded structure: { candidate: { id: ... } }
        // Extract the candidate object for easier access in controllers
        req.candidate = decoded.candidate; // Now req.candidate.id will work
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
