const { jwt, jwtkey } = require("../jwt/jwt");

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Authentication required. Please provide a token." 
            });
        }

        const decoded = jwt.verify(token, jwtkey);
        req.user = decoded; // Store user info in request
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: "Invalid or expired token" 
        });
    }
};

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: "Access denied. Admin privileges required." 
        });
    }
    next();
};

// Middleware to check if user is host
const checkHost = (req, res, next) => {
    if (req.user.role !== 'host' && req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: "Access denied. Host privileges required." 
        });
    }
    next();
};

module.exports = { checkAuth, checkAdmin, checkHost };
