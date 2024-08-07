const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/multer-config');
const photoController = require('../controllers/photoController');

// Menggunakan middleware multer di endpoint yang sesuai
router.post('/upload-foto', authenticateToken, authorizeRoles('admin'), upload.single('file'), photoController.uploadPhoto);

// Menggunakan middleware authenticateToken dan authorizeRoles di endpoint yang sesuai
router.put('/edit-foto', authenticateToken, authorizeRoles('admin'), upload.single('file'), photoController.editPhoto);

// Menggunakan middleware authenticateToken dan authorizeRoles di endpoint yang sesuai
router.delete('/delete-foto', photoController.deletePhoto);

module.exports = router;