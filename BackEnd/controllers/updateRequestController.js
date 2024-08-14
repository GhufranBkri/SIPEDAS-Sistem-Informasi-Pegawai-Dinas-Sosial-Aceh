// controllers/updateRequestController.js

const formatResponse = require('../utils/responseFormatter');
const UpdateRequest = require('../models/UpdateRequestModel');
const Employee = require('../models/EmployeeModel');

// Employee requests to update their data
const requestEmployeeUpdate = async (req, res) => {
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
};

// Get all update requests (Admin only)
const getPendingUpdateRequests = async (req, res) => {
    try {
        // Retrieve all update requests
        const updateRequests = await UpdateRequest.find();

        // Check if there are any pending update requests
        const pendingRequests = updateRequests.filter(request => request.status === 'pending');

        // If there are pending update requests
        if (pendingRequests.length) {
            return res.status(200).json(formatResponse('success', 200, pendingRequests));
        }

        // If no pending update requests found
        return res.status(404).json(formatResponse('info', 404, null, 'No pending update requests found'));

    } catch (err) {
        console.error('Error fetching update requests:', err);
        res.status(500).json(formatResponse('error', 500, null, 'Internal server error'));
    }
};

const getAllUpdateRequests = async (req, res) => {
    try {
        // Retrieve all update requests without filtering by status
        const updateRequests = await UpdateRequest.find();

        // If no update requests are found
        if (!updateRequests.length) {
            return res.status(404).json(formatResponse('error', 404, null, 'No update requests found'));
        }

        res.status(200).json(formatResponse('success', 200, updateRequests));
    } catch (err) {
        console.error('Error fetching update requests:', err);
        res.status(500).json(formatResponse('error', 500, null, 'Internal server error'));
    }
};

// Admin approves or rejects an update request
const updateRequestStatus = async (req, res) => {
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
            const { updatedData } = updateRequest;

            // Ensure updatedData is an object and not empty
            if (typeof updatedData !== 'object' || !Object.keys(updatedData).length) {
                return res.status(400).json(formatResponse('error', 400, null, 'Invalid update data'));
            }

            // Log updatedData for debugging
            console.log('Updated Data:', updatedData);

            // Use findOneAndUpdate to update the Employee document with the provided updatedData
            const updatedEmployee = await Employee.findOneAndUpdate(
                { nip: updateRequest.employeeNip },
                { $set: updatedData }, // Use $set to update fields in Employee
                { new: true, runValidators: true }
            );

            // Check if the employee was found and updated
            if (!updatedEmployee) {
                console.log('Employee not found with NIP:', updateRequest.employeeNip);
                return res.status(404).json(formatResponse('error', 404, null, 'Employee not found'));
            }
        }

        // Save the update request after processing
        const savedRequest = await updateRequest.save();
        // Respond with the saved request
        res.status(200).json(formatResponse('success', 200, savedRequest));
    } catch (err) {
        // Handle any errors that occur during the process
        console.error('Error in updateRequestStatus:', err);
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
};


module.exports = {
    requestEmployeeUpdate,
    getAllUpdateRequests,
    updateRequestStatus,
    getPendingUpdateRequests
};
