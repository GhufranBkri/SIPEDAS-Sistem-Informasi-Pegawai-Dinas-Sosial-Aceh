// controllers/photoController.js

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const formatResponse = require('../utils/responseFormatter');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload photo
const uploadPhoto = async (req, res) => {
    console.log('POST /employees/upload-foto'); // Debugging log

    try {
        // Ensure that a file is uploaded
        if (!req.file) {
            return res.status(400).json(formatResponse('error', 400, null, 'No file uploaded'));
        }

        // Upload image to Cloudinary using the buffer
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'upload-foto' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            // Create a stream from the buffer and pipe it to Cloudinary
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        // Send the Cloudinary URL in the response
        res.json(formatResponse('success', 200, { imageUrl: result.secure_url }));
    } catch (error) {
        console.error('Error in uploadFoto:', error);
        res.status(500).json(formatResponse('error', 500, null, 'Error uploading image to Cloudinary'));
    }
};

module.exports = {
    uploadPhoto,
};
