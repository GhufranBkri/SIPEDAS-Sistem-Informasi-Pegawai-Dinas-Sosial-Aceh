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

        // Create and assign a token                                                                            // expier
        const token = jwt.sign({ _id: user._id, role: user.role, nip: nip }, process.env.ACCESS_TOKEN_SECRET, {});

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


// authController.js
const updateUserDetails = async (req, res) => {
    const { nip, newEmail, newPassword } = req.body;

    try {
        // Cari user berdasarkan NIP
        const user = await User.findOne({ employeeNip: nip });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Cari employee berdasarkan NIP
        const employee = await Employee.findOne({ nip });
        if (!employee) return res.status(400).json({ message: 'Employee not found' });

        // Update email dan password jika ada perubahan
        if (newEmail) {
            user.email = newEmail;
            employee.email = newEmail; // Update email di tabel Employee
        }

        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        await employee.save(); // Simpan perubahan di tabel Employee

        res.status(200).json({ message: 'User details updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Controller untuk mengubah password oleh employee berdasarkan NIP yang sedang login
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const nip = req.user.nip; // Mendapatkan NIP dari token yang terverifikasi

    try {
        // Temukan user berdasarkan NIP yang diperoleh dari token
        const user = await User.findOne({ employeeNip: nip });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Verifikasi apakah oldPassword cocok dengan password yang saat ini tersimpan
        const validOldPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validOldPassword) return res.status(400).json({ message: 'Old password is incorrect' });

        // Hash dan simpan password baru
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


module.exports = { createFirstAdmin, registerAdmin, login, updateUserDetails, changePassword };
