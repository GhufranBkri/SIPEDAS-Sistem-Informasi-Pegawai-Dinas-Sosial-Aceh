require('dotenv').config(); // Memastikan ini berada di bagian paling atas
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
const port = 3000;

// Verifikasi MONGO_URI
console.log('Mongo URI:', process.env.MONGO_URI);

// Koneksi MongoDB
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;
db.on('error', (error) => console.error('Connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/employees', employeeRoutes);

// Root Endpoint (Opsional)
app.post('/', (req, res) => {
    res.status(200).send('Root Endpoint POST Request');
});

// Handle 404
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

// Mulai server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
