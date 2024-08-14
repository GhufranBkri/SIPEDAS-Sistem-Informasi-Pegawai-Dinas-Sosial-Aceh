// controllers/photoController.js
const Photo = require('../models/StrukturModel');

// Create or update a single photo
const createOrUpdatePhoto = async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        let photo = await Photo.findOne(); // Find the first photo (since there's only one)

        if (photo) {
            // Update existing photo
            photo.imageUrl = imageUrl;
            await photo.save();
            res.status(200).json(photo);
        } else {
            // Create a new photo
            photo = new Photo({ imageUrl });
            await photo.save();
            res.status(201).json(photo);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get the single photo
const getPhoto = async (req, res) => {
    try {
        const photo = await Photo.findOne(); // Find the first photo (since there's only one)

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        res.status(200).json(photo);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { createOrUpdatePhoto, getPhoto };
