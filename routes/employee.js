const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Create new employee
router.post('/', async (req, res) => {
    console.log('POST /employees - Received data:', req.body); // Debugging log
    const employee = new Employee(req.body);
    try {
        const savedEmployee = await employee.save();
        res.status(201).json(savedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all employees
router.get('/', async (req, res) => {
    console.log('GET /employees'); // Debugging log
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one employee by NIP
router.get('/:nip', async (req, res) => {
    console.log('GET /employees/:nip', req.params.nip); // Debugging log
    try {
        const employee = await Employee.findOne({ nip: req.params.nip });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update an employee by NIP
router.patch('/:nip', async (req, res) => {
    console.log('PATCH /employees/:nip', req.params.nip); // Debugging log
    try {
        const updatedEmployee = await Employee.findOneAndUpdate(
            { nip: req.params.nip },
            req.body,
            { new: true }
        );
        if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.json(updatedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an employee by NIP
router.delete('/:nip', async (req, res) => {
    console.log('DELETE /employees/:nip', req.params.nip); // Debugging log
    try {
        const deletedEmployee = await Employee.findOneAndDelete({ nip: req.params.nip });
        if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Import employees from CSV
router.post('/import', upload.single('file'), async (req, res) => {
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                await Employee.insertMany(results);
                res.status(200).json({ message: 'Employees imported successfully' });
            } catch (err) {
                res.status(500).json({ message: err.message });
            } finally {
                // Remove the uploaded file
                fs.unlinkSync(req.file.path);
            }
        });
});

module.exports = router;
