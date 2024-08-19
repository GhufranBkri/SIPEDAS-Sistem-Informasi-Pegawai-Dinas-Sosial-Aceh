const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/multer-config');
const photoController = require('../controllers/photoController');

// routes/photoRoutes.js
router.post('/upload-foto', authenticateToken, upload.single('image'), photoController.uploadPhoto);

// Menggunakan middleware authenticateToken dan authorizeRoles di endpoint yang sesuai
router.put('/edit-foto', authenticateToken, upload.single('image'), photoController.editPhoto);

// Menggunakan middleware authenticateToken dan authorizeRoles di endpoint yang sesuai
router.delete('/delete-foto', authenticateToken, upload.single('image'), photoController.deletePhoto);

module.exports = router;