// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const imageUpload = require('./routes/imageRoutes');

const app = express();
const port = process.env.PORT || 3000;

console.log('Mongo URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI);

app.use(cors({
    origin: 'http://localhost:5173', // Ganti dengan URL frontend Anda
    credentials: true
}));

const db = mongoose.connection;
db.on('error', (error) => console.error('Connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));

app.use(bodyParser.json());

app.use('/employees', employeeRoutes);
app.use('/auth', authRoutes);
app.use('/profile', imageUpload);

app.post('/', (req, res) => {
    res.status(200).send('Root Endpoint POST Request');
});

app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
