const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Authentication required
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: 'You are not logged in. Please log in to get access.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token is invalid or expired. Please log in again.'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Admin role required.'
        });
    }
    next();
};

// Check if user is verified
exports.isVerified = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            message: 'Please verify your email before accessing this route.'
        });
    }
    next();
};
