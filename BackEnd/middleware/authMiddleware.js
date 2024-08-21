// authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const formatResponse = require('../utils/responseFormatter'); // Menggunakan utilitas responseFormatter

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Mengambil token dari header Authorization

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        // Verifikasi token dan masukkan data ke req.user
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verified;
        next(); // Melanjutkan ke fungsi berikutnya
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
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
