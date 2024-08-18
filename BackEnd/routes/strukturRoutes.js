const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/multer-config');
const strukturController = require('../controllers/strukturController');

// Route untuk mendapatkan semua foto (membutuhkan autentikasi)
router.get('/get-foto', strukturController.getPhoto);

// Route untuk upload foto dengan autentikasi dan otorisasi
router.post('/upload-foto', authenticateToken, authorizeRoles('admin'), strukturController.createOrUpdatePhoto);


module.exports = router;
