// utils/multer-config.js
const multer = require('multer');

// Using memory storage
const storage = multer.memoryStorage();

// Configuring upload
const upload = multer({ storage: storage });

module.exports = upload;
