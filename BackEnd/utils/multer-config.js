const multer = require('multer');

// Menggunakan penyimpanan di memori
const storage = multer.memoryStorage();

// Konfigurasi upload
const upload = multer({ storage: storage });

module.exports = upload;
