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
    const { email, password } = req.body; // Menggunakan identifier untuk email atau no_telpon

    try {
        // Mencari user berdasarkan email atau no_telpon
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() }, // Mencari berdasarkan email
                { no_telpon: email } // Mencari berdasarkan no_telpon
            ]
        });

        if (!user) return res.status(400).json({ message: 'User not found' });

        // Verifikasi password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        // Mendapatkan data employee jika user adalah seorang karyawan
        let nip = null;
        if (user.role === 'employee') {
            const employee = await Employee.findOne({ nip: user.employeeNip }); // Menggunakan employeeNip dari User
            if (employee) {
                nip = employee.nip; // Nip akan ditemukan jika employee ditemukan
            }
        }


        // Membuat token JWT yang berisi _id, role, dan nip (jika ada)
        const token = jwt.sign(
            { _id: user._id, role: user.role, nip: nip, email: user.email }, // Gunakan variabel nip, bukan user.employeeNip
            process.env.ACCESS_TOKEN_SECRET
        );

        // Mengembalikan response dengan token dan informasi user
        res.header('Authorization', token).json({
            message: 'Logged in successfully',
            token,
            user: {
                email: user.email,
                no_telpon: user.no_telpon,
                role: user.role,
                nip: nip // Menampilkan nip jika user adalah employee
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// authController.js

const updateUserDetails = async (req, res) => {
    const { nip, newEmailOrPhone, newPassword } = req.body;

    try {
        // Cari user berdasarkan NIP
        const user = await User.findOne({ employeeNip: nip });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Cari employee berdasarkan NIP
        const employee = await Employee.findOne({ nip });
        if (!employee) return res.status(400).json({ message: 'Employee not found' });

        // Tentukan apakah newEmailOrPhone adalah email atau nomor telepon
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmailOrPhone);

        // Pengecekan duplikasi email atau nomor telepon
        if (newEmailOrPhone) {
            if (isEmail) {
                // Cek apakah email sudah digunakan oleh user lain
                const existingUserWithEmail = await User.findOne({ email: newEmailOrPhone });
                if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
                    return res.status(400).json({ message: 'Email is already taken' });
                }
                user.email = newEmailOrPhone;
                employee.email = newEmailOrPhone; // Update email di tabel Employee
            } else {
                // Cek apakah nomor telepon sudah digunakan oleh user lain
                const existingUserWithPhone = await User.findOne({ no_telpon: newEmailOrPhone });
                if (existingUserWithPhone && existingUserWithPhone._id.toString() !== user._id.toString()) {
                    return res.status(400).json({ message: 'Phone number is already taken' });
                }
                user.no_telpon = newEmailOrPhone;
                employee.no_telepon = newEmailOrPhone; // Update nomor telepon di tabel Employee
            }
        }

        // Update password jika ada perubahan
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

const changePasswordAdmin = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const email = req.user.email; // Mendapatkan email dari token yang terverifikasi

    try {
        // Mencari user berdasarkan email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verifikasi apakah oldPassword cocok dengan password yang saat ini tersimpan
        const validOldPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validOldPassword) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Memastikan password baru tidak sama dengan password lama
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from the old password' });
        }

        // Validasi panjang minimal password baru (opsional, bisa diatur sesuai kebutuhan)
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        // Hashing dan menyimpan password baru
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // Mengembalikan response sukses
        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        // Mengembalikan error internal jika ada kesalahan di server
        return res.status(500).json({ message: 'An error occurred while changing the password', error: err.message });
    }
};


module.exports = { createFirstAdmin, registerAdmin, login, updateUserDetails, changePassword, changePasswordAdmin };
