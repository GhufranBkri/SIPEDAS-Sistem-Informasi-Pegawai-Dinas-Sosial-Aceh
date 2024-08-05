// models/UserModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['admin', 'employee'],
        default: 'employee',
    },
    employeeNip: {
        type: String,
        ref: 'Employee',
        required: function () { return this.role === 'employee'; } // Hanya diperlukan jika role adalah employee
    }
});

module.exports = mongoose.model('User', userSchema);
