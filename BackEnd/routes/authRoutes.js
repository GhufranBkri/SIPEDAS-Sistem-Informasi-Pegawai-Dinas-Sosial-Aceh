const express = require('express');
const router = express.Router();
const { createFirstAdmin, registerAdmin, login, updateUserDetails } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// register a new admin first time
router.post('/create-first-admin', createFirstAdmin);

// Register a new admin (only accessible by admin)
router.post('/register', authenticateToken, authorizeRoles('admin'), registerAdmin);

// routes/authRoutes.js
router.put('/update-user-details', authenticateToken, authorizeRoles('admin'), updateUserDetails);

// Login a user
router.post('/login', login);

module.exports = router;
