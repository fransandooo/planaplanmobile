const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'PepeComePipas'; // Secret key for JWT signing and encryption

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(' ')[1]; // Extract token

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Verify token
        req.user = decoded; // Attach user data to request
        next(); // Move to the next middleware or route
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = authenticateToken;
