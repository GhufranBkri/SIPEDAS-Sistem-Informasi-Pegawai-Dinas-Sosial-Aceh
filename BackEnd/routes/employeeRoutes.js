// routes/employees.js

const express = require('express');
const router = express.Router();

const {
    createEmployee,
    getAllEmployees,
    getEmployeeByNip,
    updateEmployeeByNip,
    deleteEmployeeByNip,
    importEmployeesFromCsv,
} = require('../controllers/employeeController');

const { uploadPhoto } = require('../controllers/photoController');

const {
    requestEmployeeUpdate,
    getAllUpdateRequests,
    updateRequestStatus,
} = require('../controllers/updateRequestController');

const { authenticateToken, authorizeRoles, authorizeEmployeeAccess } = require('../middleware/authMiddleware');
const { uploadCsv } = require('../utils/uploadUtils'); // Import uploadCsv

// Routes
router.post('/', authenticateToken, authorizeRoles('admin'), createEmployee);
router.get('/', authenticateToken, authorizeRoles('admin'), getAllEmployees);
router.get('/:nip', authenticateToken, authorizeEmployeeAccess, getEmployeeByNip);
router.patch('/:nip', authenticateToken, authorizeEmployeeAccess, updateEmployeeByNip);
router.delete('/:nip', authenticateToken, authorizeRoles('admin'), deleteEmployeeByNip);
router.post('/import', authenticateToken, authorizeRoles('admin'), uploadCsv, importEmployeesFromCsv); // Use uploadCsv
router.post('/upload-foto', authenticateToken, uploadPhoto);
router.post('/update-request', authenticateToken, requestEmployeeUpdate);
router.get('/request/update-requests', authenticateToken, authorizeRoles('admin'), getAllUpdateRequests);
router.patch('/update-request/:id', authenticateToken, authorizeRoles('admin'), updateRequestStatus);

module.exports = router;
