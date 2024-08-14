const express = require('express');
const multer = require('multer');
const router = express.Router();
const { createEmployeeFromExcel } = require('../controllers/importController');

const upload = multer();

// Endpoint untuk mengunggah file Excel
router.post('/upload-excel', upload.single('file'), createEmployeeFromExcel);

module.exports = router;
