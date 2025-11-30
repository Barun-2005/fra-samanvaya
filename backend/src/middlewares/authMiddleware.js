const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.requireAuth = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: 'Authentication invalid.' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decodedToken.user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication invalid.' });
    }
};

exports.requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: 'Authorization failed: User roles not found.' });
        }
        
        const hasRequiredRole = req.user.roles.some(role => roles.includes(role));
        
        if (!hasRequiredRole) {
            return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
        }
        
        next();
    };
};
