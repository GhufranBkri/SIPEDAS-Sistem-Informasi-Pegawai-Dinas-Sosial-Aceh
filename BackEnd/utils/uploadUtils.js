const multer = require('multer');
const path = require('path');

// Set storage engine for CSV upload
const csvStorage = multer.diskStorage({
    destination: '/tmp/', // Use /tmp directory for serverless environments
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload for CSV
const uploadCsv = multer({
    storage: csvStorage,
    limits: { fileSize: 10000000 } // Limit file size to 10MB
}).single('file');

module.exports = { uploadCsv };
