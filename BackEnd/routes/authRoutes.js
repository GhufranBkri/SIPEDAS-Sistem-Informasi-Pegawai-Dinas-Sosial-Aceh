const express = require('express');
const router = express.Router();
const { createFirstAdmin, registerAdmin, login, updateUserDetails, changePassword } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// register a new admin first time
router.post('/create-first-admin', createFirstAdmin);

// Register a new admin (only accessible by admin)
router.post('/register', authenticateToken, authorizeRoles('admin'), registerAdmin);

// routes/authRoutes.js
router.put('/update-user-details', authenticateToken, authorizeRoles('admin'), updateUserDetails);

// Change password (accessible by employees based on NIP)
router.put('/change-password', authenticateToken, changePassword);

// Login a user
router.post('/login', login);

module.exports = router;
