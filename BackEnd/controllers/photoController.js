const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const formatResponse = require('../utils/responseFormatter');

// Konfigurasi Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload foto
const uploadPhoto = async (req, res) => {
    console.log('POST /profile/upload-foto'); // Log debugging
    console.log('Request file:', req.file); // Tambahkan log ini

    if (!req.file || !req.file.buffer) {
        return res.status(400).json(formatResponse('error', 400, null, 'No file uploaded or file buffer missing'));
    }

    try {
        // Upload gambar ke Cloudinary menggunakan buffer
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'upload-foto' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            // Membuat stream dari buffer dan mengirimkannya ke Cloudinary
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        // Mengirim URL Cloudinary dalam response
        res.json(formatResponse('success', 200, { imageUrl: result.secure_url }));
    } catch (error) {
        console.error('Error in uploadPhoto:', error);
        res.status(500).json(formatResponse('error', 500, null, 'Error mengupload gambar ke Cloudinary'));
    }
};

// Fungsi controller untuk mengganti foto
const editPhoto = async (req, res) => {
    console.log('PUT /profile/edit-foto'); // Log debugging

    try {
        const { imageUrl } = req.body;

        // Ekstrak public_id dari URL
        const public_id = 'upload-foto/' + imageUrl.split('/').slice(-1)[0].split('.')[0];

        // Hapus gambar sebelumnya
        await cloudinary.uploader.destroy(public_id, (error, result) => {
            if (error) {
                console.error('Error deleting old image:', error);
                throw new Error('Error deleting old image');
            }
            console.log('Old image deleted successfully:', result);
        });

        // Upload gambar baru ke Cloudinary menggunakan buffer
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'upload-foto', public_id: public_id, overwrite: true, invalidate: true },
                (error, result) => {
                    if (error) {
                        console.error('Error uploading new image:', error);
                        return reject(error);
                    }
                    resolve(result);
                }
            );

            // Membuat stream dari buffer dan mengirimkannya ke Cloudinary
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        // Mengirim URL Cloudinary yang baru dalam response
        res.json(formatResponse('success', 200, { imageUrl: result.secure_url }));
    } catch (error) {
        console.error('Error in editPhoto:', error);
        res.status(500).json(formatResponse('error', 500, null, 'Error mengganti gambar di Cloudinary'));
    }
};

// Hapus foto
const deletePhoto = async (req, res) => {
    console.log('DELETE /employees/delete-foto'); // Log debugging

    try {
        const { imageUrl } = req.body;

        // Logging untuk memeriksa request body
        console.log('Request body:', req.body);

        // Validasi jika imageUrl tidak ada di request body
        if (!imageUrl) {
            return res.status(400).json(formatResponse('error', 400, null, 'imageUrl tidak ditemukan di request body'));
        }

        const public_id = imageUrl.split('/').slice(-1)[0].split('.')[0];

        await cloudinary.uploader.destroy('upload-foto/' + public_id);
        console.log('Deleted image with public_id:', 'upload-foto/' + public_id);
        res.json(formatResponse('success', 200, null, 'Gambar berhasil dihapus'));
    } catch (error) {
        console.error('Error in deletePhoto:', error);
        res.status(500).json(formatResponse('error', 500, null, 'Error menghapus gambar dari Cloudinary'));
    }
};

module.exports = {
    uploadPhoto,
    editPhoto,
    deletePhoto,
};