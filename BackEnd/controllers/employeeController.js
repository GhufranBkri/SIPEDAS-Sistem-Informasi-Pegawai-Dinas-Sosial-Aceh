// controllers/employeeController.js

const bcrypt = require('bcrypt');
const formatResponse = require('../utils/responseFormatter');
const Employee = require('../models/EmployeeModel');
const User = require('../models/UserModel');

// Create employee endpoint
const createEmployee = async (req, res) => {
    console.log('POST /employees - Received data:', req.body); // Debugging log

    if (!req.body.nip) {
        return res.status(400).json(formatResponse('error', 400, null, 'NIP is required'));
    }

    const employee = new Employee(req.body);
    try {
        const savedEmployee = await employee.save();

        // Hash password (NIP)
        const hashedPassword = await bcrypt.hash(req.body.nip, 10);

        // Create new user
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            role: 'employee',
        });

        await user.save();

        res.status(201).json(formatResponse('success', 201, savedEmployee));
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json(formatResponse('error', 400, null, 'NIP already exists'));
        }
        res.status(400).json(formatResponse('error', 400, null, err.message));
    }
};

// Get all employees (Admin only)
const getAllEmployees = async (req, res) => {
    console.log('GET /employees'); // Debugging log
    try {
        const employees = await Employee.find();
        res.status(200).json(formatResponse('success', 200, employees));
    } catch (err) {
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
};

// Get one employee by NIP (Employee can only get their own data)
const getEmployeeByNip = async (req, res) => {
    console.log('GET /employees/:nip', req.params.nip); // Debugging log
    try {
        const employee = await Employee.findOne({ nip: req.params.nip });
        if (!employee) return res.status(404).json(formatResponse('error', 404, null, 'Employee not found'));
        res.status(200).json(formatResponse('success', 200, employee));
    } catch (err) {
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
};

// Get user by ID (only allow access to their own data)
const getUserById = async (req, res) => {
    console.log('GET /users/:id', req.params.id); // Debugging log

    try {
        const { id } = req.params;

        // Check if the authenticated user is trying to access their own data
        if (req.user._id !== id) {
            return res.status(403).json(formatResponse('error', 403, null, 'Access denied: You can only access your own data'));
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json(formatResponse('error', 404, null, 'User not found'));
        }

        res.status(200).json(formatResponse('success', 200, user));
    } catch (err) {
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
};


// Update an employee by NIP (Employee can only update their own data)
const updateEmployeeByNip = async (req, res) => {
    const { nip } = req.params;
    const updatedData = req.body;

    try {
        const updatedEmployee = await Employee.findOneAndUpdate(
            { nip },
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json(formatResponse('error', 404, null, 'Employee not found'));
        }

        res.status(200).json(formatResponse('success', 200, updatedEmployee));
    } catch (err) {
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
};

// Delete an employee by NIP (Admin only)
const deleteEmployeeByNip = async (req, res) => {
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
};

// Import employees from CSV (Admin only)
const importEmployeesFromCsv = async (req, res) => {
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
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeByNip,
    updateEmployeeByNip,
    deleteEmployeeByNip,
    importEmployeesFromCsv,
    getUserById
};