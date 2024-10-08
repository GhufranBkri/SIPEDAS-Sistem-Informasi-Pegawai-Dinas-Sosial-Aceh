// controllers/updateRequestController.js

const formatResponse = require('../utils/responseFormatter');
const UpdateRequest = require('../models/UpdateRequestModel');
const Employee = require('../models/EmployeeModel');
const cloudinary = require('../config/cloudinaryConfig');
const User = require('../models/UserModel');

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

    // Validasi status
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json(formatResponse('error', 400, null, 'Status tidak valid'));
    }

    try {
        // Temukan permintaan update berdasarkan ID
        const updateRequest = await UpdateRequest.findById(id);
        if (!updateRequest) {
            return res.status(404).json(formatResponse('error', 404, null, 'Permintaan update tidak ditemukan'));
        }

        // Update status, tanggal respons, dan respons admin
        updateRequest.status = status;
        updateRequest.responseDate = new Date();
        updateRequest.adminResponse = adminResponse;

        // Jika status disetujui (approved)
        if (status === 'approved') {
            const { updatedData } = updateRequest;

            // Validasi updatedData
            if (typeof updatedData !== 'object' || !Object.keys(updatedData).length) {
                return res.status(400).json(formatResponse('error', 400, null, 'Data update tidak valid'));
            }

            // Temukan karyawan dan hapus foto lama jika ada foto baru
            const employee = await Employee.findOne({ nip: updateRequest.employeeNip });
            if (employee && updatedData.foto) {
                // Hapus foto lama dari Cloudinary
                try {
                    const public_id = employee.foto.split('/').slice(-1)[0].split('.')[0];
                    await cloudinary.uploader.destroy('upload-foto/' + public_id);
                    console.log('Gambar lama berhasil dihapus:', public_id);
                } catch (err) {
                    console.error('Kesalahan saat menghapus gambar lama dari Cloudinary:', err.message);
                    return res.status(500).json(formatResponse('error', 500, null, 'Kesalahan saat menghapus gambar lama'));
                }
            }

            // Update data karyawan dengan data baru
            const updatedEmployee = await Employee.findOneAndUpdate(
                { nip: updateRequest.employeeNip },
                { $set: updatedData },
                { new: true, runValidators: true }
            );

            // Jika karyawan tidak ditemukan
            if (!updatedEmployee) {
                return res.status(404).json(formatResponse('error', 404, null, 'Karyawan tidak ditemukan'));
            }

            // Cek apakah terdapat email atau nomor telepon dalam updatedData
            if (updatedData.email || updatedData.no_telepon) {
                const user = await User.findOne({ employeeNip: updateRequest.employeeNip });

                if (user) {
                    // Validasi apakah email sudah digunakan
                    if (updatedData.email) {
                        const emailExists = await User.findOne({ email: updatedData.email });
                        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                            return res.status(400).json(formatResponse('error', 400, null, 'Email sudah digunakan'));
                        }
                        user.email = updatedData.email;
                    }

                    // Validasi apakah nomor telepon sudah digunakan
                    if (updatedData.no_telepon) {
                        const phoneExists = await User.findOne({ no_telepon: updatedData.no_telepon });
                        if (phoneExists && phoneExists._id.toString() !== user._id.toString()) {
                            return res.status(400).json(formatResponse('error', 400, null, 'Nomor telepon sudah digunakan'));
                        }
                        user.no_telpon = updatedData.no_telepon;
                    }

                    // Simpan perubahan pada user
                    await user.save();
                }
            }
        }

        // Jika status ditolak (rejected) dan ada foto di UpdateRequest
        if (status === 'rejected' && updateRequest.updatedData.foto) {
            try {
                const public_id = updateRequest.updatedData.foto.split('/').slice(-1)[0].split('.')[0];
                await cloudinary.uploader.destroy('upload-foto/' + public_id);
                console.log('Gambar yang di-upload pada permintaan update berhasil dihapus:', public_id);
            } catch (err) {
                console.error('Kesalahan saat menghapus gambar dari Cloudinary:', err.message);
                return res.status(500).json(formatResponse('error', 500, null, 'Kesalahan saat menghapus gambar'));
            }
        }

        // Simpan permintaan update setelah diproses
        const savedRequest = await updateRequest.save();
        res.status(200).json(formatResponse('success', 200, savedRequest));
    } catch (err) {
        console.error('Kesalahan dalam updateRequestStatus:', err);
        res.status(500).json(formatResponse('error', 500, null, err.message));
    }
};




// Get a single update request by _id
const getUpdateRequestById = async (req, res) => {
    const { id } = req.params;

    try {
        // Cari permintaan update berdasarkan _id
        const updateRequest = await UpdateRequest.findById(id);

        // Jika permintaan update tidak ditemukan
        if (!updateRequest) {
            return res.status(404).json(formatResponse('error', 404, null, 'Update request not found'));
        }

        // Kirim respon sukses dengan data update request
        res.status(200).json(formatResponse('success', 200, updateRequest));
    } catch (err) {
        console.error('Error fetching update request by ID:', err);
        res.status(500).json(formatResponse('error', 500, null, 'Internal server error'));
    }
};

const deleteUpdateRequest = async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the update request by ID
        const updateRequest = await UpdateRequest.findOneAndDelete({ _id: id });

        // If the update request doesn't exist
        if (!updateRequest) {
            return res.status(404).json(formatResponse('error', 404, null, 'Update request not found'));
        }

        // If there is a photo associated with the update request, delete it from Cloudinary
        if (updateRequest.updatedData.foto) {
            try {
                const public_id = updateRequest.updatedData.foto.split('/').slice(-1)[0].split('.')[0];
                await cloudinary.uploader.destroy('upload-foto/' + public_id);
                console.log('Associated image successfully deleted from Cloudinary:', public_id);
            } catch (err) {
                console.error('Error deleting associated image from Cloudinary:', err.message);
                return res.status(500).json(formatResponse('error', 500, null, 'Error deleting associated image'));
            }
        }

        // Send a success response with a notification
        res.status(200).json(formatResponse('success', 200, null, `Update request with ID ${id} successfully deleted`));

    } catch (err) {
        console.error('Error deleting update request:', err);
        res.status(500).json(formatResponse('error', 500, null, 'Internal server error'));
    }
};




module.exports = {
    requestEmployeeUpdate,
    getAllUpdateRequests,
    updateRequestStatus,
    getPendingUpdateRequests,
    getUpdateRequestById,
    deleteUpdateRequest
};
