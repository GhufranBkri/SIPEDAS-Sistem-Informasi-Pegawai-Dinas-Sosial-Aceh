const express = require('express');
const router = express.Router();
const { requestEmployeeUpdate, getAllUpdateRequests, updateRequestStatus, getPendingUpdateRequests, getUpdateRequestById, deleteUpdateRequest } = require('../controllers/updateRequestController');
const { authenticateToken, authorizeRoles, authorizeEmployeeAccess } = require('../middleware/authMiddleware');

// Request update data
router.post('/update-request', authenticateToken, requestEmployeeUpdate);

// Get all update requests (Admin only)
router.get('/update-request', authenticateToken, authorizeRoles('admin'), getAllUpdateRequests);

// Get requests by id (Admin only)
router.get('/update-request/:id', authenticateToken, authorizeRoles('admin'), getUpdateRequestById);

// Get all update requests (Admin only)
router.get('/pending-request', authenticateToken, authorizeRoles('admin'), getPendingUpdateRequests);

// Endpoint untuk menyetujui atau menolak permintaan pembaruan
router.put('/update-request/:id', authenticateToken, authorizeRoles('admin'), updateRequestStatus);

// delete request
router.delete('/deleted-request/:id', authenticateToken, authorizeRoles('admin'), deleteUpdateRequest);


module.exports = router;