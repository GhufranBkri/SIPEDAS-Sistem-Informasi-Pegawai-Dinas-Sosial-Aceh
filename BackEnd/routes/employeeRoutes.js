// routes/employees.js
const express = require('express');
const router = express.Router();
const { requestEmployeeUpdate, getAllUpdateRequests, updateRequestStatus } = require('../controllers/updateRequestController');
const employee = require('../controllers/employeeController');
const { uploadPhoto } = require('../controllers/photoController');
const { authenticateToken, authorizeRoles, authorizeEmployeeAccess } = require('../middleware/authMiddleware');
const { uploadCsv } = require('../utils/uploadUtils');
const upload = require('../utils/multer-config');


// Routes
// Buat Karyawan Baru (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), employee.createEmployee);

// Get all employees (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), employee.getAllEmployees);

router.get('/visual', employee.getAllEmployees);

// Get employee by NIP (only admin)
router.get('/:nip', authenticateToken, authorizeEmployeeAccess, employee.getEmployeeByNip);

// Update employee by NIP
router.patch('/:nip', authenticateToken, authorizeEmployeeAccess, employee.updateEmployeeByNip);

// Delete employee by NIP
router.delete('/:nip', authenticateToken, authorizeRoles('admin'), employee.deleteEmployeeByNip);

// import employees from CSV (Admin only)
router.post('/import', authenticateToken, authorizeRoles('admin'), uploadCsv, employee.importEmployeesFromCsv);

// Upload photo
router.post('/upload-foto', authenticateToken, authorizeRoles('admin'), upload.single('image'), uploadPhoto);


// Route untuk mendapatkan data user (berdasarkan NIP dari token)
router.get('/users/me', authenticateToken, employee.getEmployeeByToken);


module.exports = router;
