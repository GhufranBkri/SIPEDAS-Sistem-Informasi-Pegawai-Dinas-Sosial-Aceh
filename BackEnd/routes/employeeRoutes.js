// routes/employees.js
const express = require('express');
const router = express.Router();
const { requestEmployeeUpdate, getAllUpdateRequests, updateRequestStatus } = require('../controllers/updateRequestController');
const { createEmployee, getAllEmployees, getEmployeeByNip, updateEmployeeByNip, deleteEmployeeByNip, importEmployeesFromCsv, getUserById } = require('../controllers/employeeController');
const { uploadPhoto } = require('../controllers/photoController');
const { authenticateToken, authorizeRoles, authorizeEmployeeAccess } = require('../middleware/authMiddleware');
const { uploadCsv } = require('../utils/uploadUtils');
const upload = require('../utils/multer-config');


// Routes
// Buat Karyawan Baru (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), createEmployee);

// Get all employees (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), getAllEmployees);

// Get employee by NIP (Employee can only get their own data)
router.get('/:nip', authenticateToken, authorizeEmployeeAccess, getEmployeeByNip);

// Update employee by NIP
router.patch('/:nip', authenticateToken, authorizeEmployeeAccess, updateEmployeeByNip);

// Delete employee by NIP
router.delete('/:nip', authenticateToken, authorizeRoles('admin'), deleteEmployeeByNip);

// import employees from CSV (Admin only)
router.post('/import', authenticateToken, authorizeRoles('admin'), uploadCsv, importEmployeesFromCsv);

// Upload photo
router.post('/upload-foto', authenticateToken, authorizeRoles('admin'), upload.single('image'), uploadPhoto);

// Request update data
router.post('/update-request', authenticateToken, requestEmployeeUpdate);

// Get all update requests (Admin only)
router.get('/request/update-requests', authenticateToken, authorizeRoles('admin'), getAllUpdateRequests);

// Update request status (Admin only)
router.patch('/update-request/:id', authenticateToken, authorizeRoles('admin'), updateRequestStatus);

// Get user data by ID (self-access only)
router.get('/:id', authenticateToken, getUserById);

module.exports = router;
