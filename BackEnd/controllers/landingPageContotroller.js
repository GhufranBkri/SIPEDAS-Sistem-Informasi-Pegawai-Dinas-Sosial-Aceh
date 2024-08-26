const mongoose = require('mongoose');
const Employee = require('../models/EmployeeModel'); // Sesuaikan path jika diperlukan

// Controller untuk visualisasi data
const visualisasiData = async (req, res) => {
    try {
        // Hitung total berdasarkan jenis
        const totalKaryawan = await Employee.countDocuments();
        const totalPNS = await Employee.countDocuments({ jenis: 'PNS' });
        const totalTenagaKontrak = await Employee.countDocuments({ jenis: 'TEKON' });
        const totalPPPK = await Employee.countDocuments({ jenis: 'PPPK' });

        // Hitung total setiap jenis kelamin untuk pie chart
        const genderCounts = await Employee.aggregate([
            { $group: { _id: "$jenis_kelamin", count: { $sum: 1 } } }
        ]);

        // Hitung jumlah orang per 'bidang' untuk bar chart
        const bidangCounts = await Employee.aggregate([
            { $group: { _id: "$bidang", count: { $sum: 1 } } }
        ]);

        // Hitung total setiap level pendidikan untuk pie chart
        const pendidikanCounts = await Employee.aggregate([
            { $group: { _id: "$pendidikan", count: { $sum: 1 } } }
        ]);

        // Respond dengan data yang telah dihitung
        res.json({
            totalKaryawan,
            totalPNS,
            totalTenagaKontrak,
            totalPPPK,
            genderCounts,
            bidangCounts,
            pendidikanCounts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { visualisasiData };
