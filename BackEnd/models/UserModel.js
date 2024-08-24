const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
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
    },
    no_telpon: {
        type: String,
    }
});

module.exports = mongoose.model('User', userSchema);
