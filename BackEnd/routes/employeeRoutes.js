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


// Get user data by ID (self-access only)
router.get('/:id', authenticateToken, employee.getUserById);

module.exports = router;
