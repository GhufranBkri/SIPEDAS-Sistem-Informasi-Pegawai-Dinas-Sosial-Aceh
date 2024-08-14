// models/Photo.js
const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StrukturModel', photoSchema);
