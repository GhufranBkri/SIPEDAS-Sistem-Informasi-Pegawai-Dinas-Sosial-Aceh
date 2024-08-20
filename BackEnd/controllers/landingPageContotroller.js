const mongoose = require('mongoose');
const Employee = require('../models/EmployeeModel'); // Adjust the path as necessary

// Controller for visualizing data
const visualisasiData = async (req, res) => {
    try {
        // Get total count of each gender for the pie chart
        const genderCounts = await Employee.aggregate([
            { $group: { _id: "$jenis_kelamin", count: { $sum: 1 } } }
        ]);

        // Get the number of people per 'bidang' for the bar chart
        const bidangCounts = await Employee.aggregate([
            { $group: { _id: "$bidang", count: { $sum: 1 } } }
        ]);

        // Get total count of each education level for the pie chart
        const pendidikanCounts = await Employee.aggregate([
            { $group: { _id: "$pendidikan", count: { $sum: 1 } } }
        ]);

        // Respond with the aggregated data
        res.json({
            genderCounts,
            bidangCounts,
            pendidikanCounts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = { visualisasiData };