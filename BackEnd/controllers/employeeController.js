// controllers/employeeController.jss
const fs = require('fs'); // Tambahkan ini untuk menggunakan fs
const fastcsv = require('fast-csv'); // Pastikan fast-csv diimpor
const bcrypt = require('bcrypt');
const formatResponse = require('../utils/responseFormatter');
const Employee = require('../models/EmployeeModel');
const moment = require('moment'); // Ensure you have moment installed
const User = require('../models/UserModel');
const cloudinary = require('../config/cloudinaryConfig');


// Fungsi untuk meng-hash password
const hashPassword = async (nip) => {
    return await bcrypt.hash(nip, 10); // Hash berdasarkan NIP
};

// Create employee endpoint
const createEmployee = async (req, res) => {
    console.log('POST /employees - Received data:', req.body); // Debugging log

    // Validasi input
    if (!req.body.nip || !req.body.email || !req.body.no_telepon) {
        return res.status(400).json(formatResponse('error', 400, null, 'NIP, email, and phone number are required'));
    }

    // Validasi format nomor telepon (hanya angka)
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(req.body.no_telepon)) {
        return res.status(400).json(formatResponse('error', 400, null, 'Phone number must contain only digits'));
    }

    // Pastikan panjang nomor telepon tidak melebihi batas
    if (req.body.no_telepon.length > 15) {
        return res.status(400).json(formatResponse('error', 400, null, 'Phone number is too long'));
    }

    const employeeData = req.body;

    try {
        // Simpan data Employee ke database
        const employee = new Employee(employeeData);
        const savedEmployee = await employee.save();

        // Hash password berdasarkan NIP
        const hashedPassword = await bcrypt.hash(req.body.nip, 10);

        // Buat user baru untuk employee yang baru dibuat
        const user = new User({
            email: req.body.email,
            no_telepon: req.body.no_telepon,
            password: hashedPassword,
            role: 'employee',
            employeeNip: req.body.nip
        });

        await user.save();

        // Jika berhasil, kembalikan respon sukses
        res.status(201).json(formatResponse('success', 201, savedEmployee));
    } catch (err) {
        console.error('Error creating employee:', err);

        // Error untuk NIP, email, atau nomor telepon yang sudah ada (error 11000)
        if (err.code === 11000) {
            let message = 'Duplicate field error';
            if (err.keyPattern && err.keyPattern.nip) {
                message = 'NIP already exists';
            } else if (err.keyPattern && err.keyPattern.email) {
                message = 'Email already exists';
            } else if (err.keyPattern && err.keyPattern.no_telepon) {
                message = 'Phone number already exists';
            }
            return res.status(400).json(formatResponse('error', 400, null, message));
        }

        // Kembalikan error untuk kasus lain
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



const getEmployeeByToken = async (req, res) => {
    try {
        // Ambil NIP dari token (dihasilkan dari middleware autentikasi)
        const { nip } = req.user; // Mengambil nip dari token yang ada di req.user

        // Cari employee berdasarkan NIP yang didapat dari token
        const employee = await Employee.findOne({ nip });

        // Jika employee tidak ditemukan
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Mengembalikan data employee dalam response
        res.status(200).json({
            message: 'Employee data found',
            employee
        });
    } catch (err) {
        // Jika ada error, kembalikan respons 500 dengan pesan error
        res.status(500).json({ message: err.message });
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

// Hapus karyawan berdasarkan NIP (Hanya Admin)
const deleteEmployeeByNip = async (req, res) => {
    console.log('DELETE /employees/:nip', req.params.nip); // Log untuk debugging
    try {
        const deletedEmployee = await Employee.findOneAndDelete({ nip: req.params.nip });
        if (!deletedEmployee) {
            return res.status(404).json(formatResponse('error', 404, null, 'Karyawan tidak ditemukan'));
        }

        // Menghapus foto terkait di Cloudinary jika ada
        if (deletedEmployee.foto) {
            try {
                const public_id = deletedEmployee.foto.split('/').slice(-1)[0].split('.')[0];
                await cloudinary.uploader.destroy('upload-foto/' + public_id);
                console.log('Gambar dengan public_id telah dihapus:', 'upload-foto/' + public_id);
            } catch (error) {
                console.error('Terjadi kesalahan saat menghapus gambar dari Cloudinary:', error.message);
                return res.status(500).json(formatResponse('error', 500, null, 'Kesalahan saat menghapus gambar dari Cloudinary'));
            }
        }

        const deletedUser = await User.findOneAndDelete({ email: deletedEmployee.email });
        if (!deletedUser) {
            return res.status(404).json(formatResponse('error', 404, null, 'User tidak ditemukan'));
        }

        res.status(200).json(formatResponse('success', 200, null, 'Karyawan, user yang terkait, dan foto berhasil dihapus'));
    } catch (err) {
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
};


// Fungsi untuk import CSV
const importEmployeesFromCsv = async (req, res) => {
    try {
        const fileRows = [];
        const filePath = req.file.path; // Get the path of the uploaded CSV file

        // Read CSV
        fs.createReadStream(filePath)
            .pipe(fastcsv.parse({ headers: true }))
            .on('data', (row) => {
                fileRows.push(row); // Push each row of the CSV into an array
            })
            .on('end', async () => {
                // Process each row in the CSV
                for (const row of fileRows) {
                    try {
                        // Upload photo if it exists
                        let imageUrl = '';
                        if (row.foto) {
                            const buffer = fs.readFileSync(row.foto); // Read the photo from the specified path
                            imageUrl = await uploadPhotoToCloudinary(buffer); // Upload to Cloudinary
                        }

                        // Convert date format using moment
                        const tanggalLahir = moment(row.tanggal_lahir, 'M/D/YYYY').toDate();

                        // Prepare Employee data based on the schema
                        const employeeData = {
                            nip: row.nip,
                            nama: row.nama,
                            bidang: row.bidang,
                            eselon: row.eselon,
                            sub_bidang: row.sub_bidang,
                            jabatan_terakhir: row.jabatan_terakhir,
                            gol_ruang: row.gol_ruang,
                            jenjang: row.jenjang,
                            jenis: row.jenis,
                            jenis_kelamin: row.jenis_kelamin,
                            tempat_lahir: row.tempat_lahir,
                            tanggal_lahir: tanggalLahir, // Convert to Date
                            nik: row.nik,
                            npwp: row.npwp,
                            no_rekening: row.no_rekening,
                            no_kk: row.no_kk,
                            golongan_darah: row.golongan_darah,
                            no_telepon: row.no_telepon,
                            email: row.email,
                            email_gov : row.email_gov,
                            pendidikan: row.pendidikan,
                            jurusan: row.jurusan,
                            tahun_tamat: row.tahun_tamat,
                            // foto: imageUrl, 
                            jalan: row.jalan,
                            desa: row.desa,
                            kecamatan: row.kecamatan,
                            kabupaten: row.kabupaten,
                            alamat_lengkap: row.alamat_lengkap,
                            tahun_sk_awal: row.tahun_sk_awal,
                            tahun_sk_akhir: row.tahun_sk_akhir,
                            masa_kerja: row.masa_kerja,
                            no_req_bkn: row.no_req_bkn,
                            jenis_tekon: row.jenis_tekon,
                            Kelas_jabatan: row.Kelas_jabatan,
                        };

                        // Save Employee data
                        const employee = new Employee(employeeData);
                        const savedEmployee = await employee.save();

                        // Hash password and create User
                        const hashedPassword = await hashPassword(row.nip);
                        const userData = {
                            email: row.email,
                            no_telpon: row.no_telepon,
                            password: hashedPassword,
                            role: 'employee',
                            employeeNip: row.nip,
                        };

                        const user = new User(userData);
                        await user.save();
                    } catch (error) {
                        console.error(`Error processing row with NIP ${row.nip}:`, error);
                        // Continue to the next row if there's an error
                    }
                }

                // Send success response after all data is processed
                res.status(201).json({ status: 'success', message: 'Employees imported successfully' });
            });
    } catch (error) {
        console.error('Error importing employees:', error);
        res.status(500).json({ status: 'error', message: 'Error importing employees' });
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeByNip,
    updateEmployeeByNip,
    deleteEmployeeByNip,
    importEmployeesFromCsv,
    getEmployeeByToken
};
