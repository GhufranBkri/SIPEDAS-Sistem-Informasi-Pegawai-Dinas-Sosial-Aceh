const express = require('express');
const router = express.Router();
const { createFirstAdmin, registerAdmin, login } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// register a new admin first time
router.post('/create-first-admin', createFirstAdmin);

// Register a new admin (only accessible by admin)
router.post('/register', authenticateToken, authorizeRoles('admin'), registerAdmin);

// Login a user
router.post('/login', login);

module.exports = router;
