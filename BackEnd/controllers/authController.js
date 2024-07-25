// authController.js

const User = require('../models/UserModel');
const Employee = require('../models/EmployeeModel'); // Tambahkan ini
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Endpoint khusus untuk membuat admin pertama kali
const createFirstAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cek apakah sudah ada admin di database
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(403).json({ message: 'Admin already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat admin dengan role 'admin'
        const user = new User({
            email,
            password: hashedPassword,
            role: 'admin'
        });

        const savedUser = await user.save();
        res.status(201).json({ message: 'Admin created successfully', user: savedUser });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const registerAdmin = async (req, res) => {
    const { email, password } = req.body;

    console.log('Register request body:', req.body); // Tambahkan log ini untuk debugging

    try {
        // Pastikan email tidak kosong
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Pastikan password tidak kosong
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with role 'admin'
        const user = new User({
            email,
            password: hashedPassword,
            role: 'admin'
        });

        const savedUser = await user.save();
        res.status(201).json({ message: 'Admin registered successfully', user: savedUser });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        // Get employee data if role is employee
        let nip = null;
        if (user.role === 'employee') {
            const employee = await Employee.findOne({ email });
            if (employee) {
                nip = employee.nip;
            }
        }

        // Create and assign a token
        const token = jwt.sign({ _id: user._id, role: user.role, nip: nip }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // Return response with token and optionally nip
        res.header('Authorization', token).json({
            message: 'Logged in successfully',
            token,
            user: {
                email: user.email,
                role: user.role,
                nip: nip
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { createFirstAdmin, registerAdmin, login };
