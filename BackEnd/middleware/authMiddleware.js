// authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const formatResponse = require('../utils/responseFormatter'); // Menggunakan utilitas responseFormatter

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json(formatResponse('error', 401, null, 'Token akses tidak ditemukan'));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json(formatResponse('error', 403, null, 'Token tidak valid atau telah kedaluwarsa'));
        }
        req.user = user;
        next();
    });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json(formatResponse('error', 403, null, 'Anda tidak memiliki peran yang diperlukan untuk mengakses sumber daya ini'));
        }
        next();
    };
};

const authorizeEmployeeAccess = (req, res, next) => {
    if (req.user.role === 'employee' && req.params.nip !== req.user.nip) {
        return res.status(403).json(formatResponse('error', 403, null, 'Anda tidak diizinkan mengakses informasi karyawan lain'));
    }
    next();
};

module.exports = { authenticateToken, authorizeRoles, authorizeEmployeeAccess };
