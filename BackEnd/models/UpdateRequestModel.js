// models/UpdateRequestModel.js
const mongoose = require('mongoose');

const updateRequestSchema = new mongoose.Schema({
    employeeNip: {
        type: String,
        required: true,
    },
    updatedData: {
        type: Map,
        of: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    requestDate: {
        type: Date,
        default: Date.now,
    },
    responseDate: {
        type: Date,
    },
    adminResponse: {
        type: String,
    },
});

module.exports = mongoose.model('UpdateRequest', updateRequestSchema);
