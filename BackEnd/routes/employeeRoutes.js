// employeeRoutes.js

const express = require('express');
const router = express.Router();
const Employee = require('../models/EmployeeModel');
const User = require('../models/UserModel');
const UpdateRequest = require('../models/UpdateRequestModel'); // Tambahkan ini
const multer = require('multer');
const csvParser = require('csv-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const formatResponse = require('../utils/responseFormatter');
const { authenticateToken, authorizeRoles, authorizeEmployeeAccess } = require('../middleware/authMiddleware');

// Konfigurasi multer untuk menyimpan buffer
const storage = multer.memoryStorage(); // Gunakan memoryStorage untuk buffer

// Inisialisasi multer dengan konfigurasi penyimpanan dan batas ukuran file
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Batas ukuran file 1MB
    fileFilter: function (req, file, cb) {
        // Validasi tipe file (hanya menerima gambar)
        checkFileType(file, cb);
    }
}).single('foto'); // 'foto' adalah nama field input dari form

// Fungsi untuk memeriksa tipe file
function checkFileType(file, cb) {
    // Menentukan ekstensi file yang diperbolehkan
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Hanya gambar dengan format JPEG, JPG, atau PNG yang diperbolehkan!');
    }
}

// Membuat karyawan baru (hanya Admin)
router.post('/', authenticateToken, authorizeRoles('admin'), upload, async (req, res) => {
    console.log('POST /employees - Received data:', req.body); // Debugging log

    if (!req.file) {
        return res.status(400).json(formatResponse('error', 400, null, 'Foto harus diunggah'));
    }

    // Mengambil buffer dari file yang diunggah
    const fotoBuffer = req.file.buffer;

    const employee = new Employee({
        ...req.body,
        foto: fotoBuffer // Menyimpan buffer foto ke database
    });

    try {
        const savedEmployee = await employee.save();

        const hashedPassword = await bcrypt.hash(req.body.nip, 10);

        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            role: 'employee',
        });

        await user.save();

        res.status(201).json(formatResponse('success', 201, savedEmployee));
    } catch (err) {
        res.status(400).json(formatResponse('error', 400, null, err.message));
    }
});

// Get all employees (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    console.log('GET /employees'); // Debugging log
    try {
        const employees = await Employee.find();
        res.status(200).json(formatResponse('success', 200, employees));
    } catch (err) {
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
});

// Get one employee by NIP (Employee can only get their own data)
router.get('/:nip', authenticateToken, authorizeEmployeeAccess, async (req, res) => {
    console.log('GET /employees/:nip', req.params.nip); // Debugging log
    try {
        const employee = await Employee.findOne({ nip: req.params.nip });
        if (!employee) return res.status(404).json(formatResponse('error', 404, null, 'Employee not found'));
        res.status(200).json(formatResponse('success', 200, employee));
    } catch (err) {
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
});

// Employee requests to update their data
router.post('/update-request', authenticateToken, async (req, res) => {
    const { nip, updatedData } = req.body;

    // Validate input
    if (!nip || !updatedData) {
        return res.status(400).json(formatResponse('error', 400, null, 'NIP and updatedData are required'));
    }

    // Validate user role and NIP
    if (req.user.role !== 'employee' || req.user.nip !== nip) {
        return res.status(403).json(formatResponse('error', 403, null, 'Access denied'));
    }

    const updateRequest = new UpdateRequest({
        employeeNip: nip,
        updatedData,
    });

    try {
        const savedRequest = await updateRequest.save();
        res.status(201).json(formatResponse('success', 201, savedRequest));
    } catch (err) {
        console.error('Error saving update request:', err);
        res.status(500).json(formatResponse('error', 500, null, 'Internal server error'));
    }
});

// Get all update requests (Admin only)
router.get('/request/update-requests', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const updateRequests = await UpdateRequest.find({ status: 'pending' });

        // If no update requests are found
        if (!updateRequests.length) {
            return res.status(404).json(formatResponse('error', 404, null, 'No pending update requests found'));
        }

        res.status(200).json(formatResponse('success', 200, updateRequests));
    } catch (err) {
        console.error('Error fetching update requests:', err);
        res.status(500).json(formatResponse('error', 500, null, 'Internal server error'));
    }
});

// Admin approves or rejects an update request
router.patch('/update-request/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    // Check if the status is either 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json(formatResponse('error', 400, null, 'Invalid status'));
    }

    try {
        // Find the update request by ID
        const updateRequest = await UpdateRequest.findById(id);
        if (!updateRequest) {
            return res.status(404).json(formatResponse('error', 404, null, 'Update request not found'));
        }

        // Update the status, response date, and admin response
        updateRequest.status = status;
        updateRequest.responseDate = new Date();
        updateRequest.adminResponse = adminResponse;

        // If the status is approved, update the Employee data
        if (status === 'approved') {
            // Destructure updatedData from the updateRequest
            const { updatedData } = updateRequest;
            // Use findOneAndUpdate to update the Employee document with the provided updatedData
            const updatedEmployee = await Employee.findOneAndUpdate(
                { nip: updateRequest.employeeNip },
                { $set: updatedData },
                { new: true, runValidators: true }
            );

            // Check if the employee was found and updated
            if (!updatedEmployee) {
                return res.status(404).json(formatResponse('error', 404, null, 'Employee not found'));
            }
        }

        // Save the update request
        const savedRequest = await updateRequest.save();
        // Respond with the saved request
        res.status(200).json(formatResponse('success', 200, savedRequest));
    } catch (err) {
        // Handle any errors that occur during the process
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
});

// Update an employee by NIP (Employee can only update their own data)
router.patch('/:nip', authenticateToken, authorizeEmployeeAccess, async (req, res) => {
    console.log('PATCH /employees/:nip', req.params.nip); // Debugging log
    try {
        const { foto, ...updateData } = req.body;

        // Check if a new Base64 encoded foto is provided
        if (foto) {
            updateData.foto = foto;
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            { nip: req.params.nip },
            updateData,
            { new: true, runValidators: true } // Ensure validation is run
        );
        if (!updatedEmployee) return res.status(404).json(formatResponse('error', 404, null, 'Employee not found'));
        res.status(200).json(formatResponse('success', 200, updatedEmployee));
    } catch (err) {
        res.status(400).json(formatResponse('error', 400, null, err.message));
    }
});

// Delete an employee by NIP (Admin only)
router.delete('/:nip', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    console.log('DELETE /employees/:nip', req.params.nip); // Debugging log
    try {
        // Find the employee to delete
        const deletedEmployee = await Employee.findOneAndDelete({ nip: req.params.nip });
        if (!deletedEmployee) return res.status(404).json(formatResponse('error', 404, null, 'Employee not found'));

        // Find and delete the corresponding user
        const deletedUser = await User.findOneAndDelete({ email: deletedEmployee.email });
        if (!deletedUser) {
            return res.status(404).json(formatResponse('error', 404, null, 'User not found'));
        }

        res.status(200).json(formatResponse('success', 200, null, 'Employee and corresponding user deleted'));
    } catch (err) {
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
});

// Set storage engine for CSV upload
const csvStorage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload for CSV
const uploadCsv = multer({
    storage: csvStorage,
    limits: { fileSize: 10000000 } // Limit file size to 10MB
}).single('file');

// Import employees from CSV (Admin only)
router.post('/import', authenticateToken, authorizeRoles('admin'), uploadCsv, async (req, res) => {
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                await Employee.insertMany(results);
                res.status(200).json(formatResponse('success', 200, null, 'Employees imported successfully'));
            } catch (err) {
                res.status(500).json(formatResponse('error', 500, null, err.message));
            } finally {
                // Remove the uploaded file
                fs.unlinkSync(req.file.path);
            }
        });
});

module.exports = router;
