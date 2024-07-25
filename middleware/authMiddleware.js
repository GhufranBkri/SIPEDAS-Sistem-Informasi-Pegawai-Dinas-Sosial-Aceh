// authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.sendStatus(403);
        }
        next();
    };
};

const authorizeEmployeeAccess = (req, res, next) => {
    if (req.user.role === 'employee' && req.params.nip !== req.user.nip) {
        return res.sendStatus(403);
    }
    next();
};

module.exports = { authenticateToken, authorizeRoles, authorizeEmployeeAccess };
