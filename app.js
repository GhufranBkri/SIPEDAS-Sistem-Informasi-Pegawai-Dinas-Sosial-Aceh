const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const employeeRoutes = require('./routes/employee');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;
const dbURI = "mongodb+srv://a322d4ky4308:75JbqCMaew1DM3BR@dinsosdb.lngowvs.mongodb.net/?retryWrites=true&w=majority&appName=DINSOSDB"
// MongoDB connection
mongoose.connect(process.env.dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));


// Middleware
app.use(bodyParser.json());

// Routes
app.use('/employees', employeeRoutes);

// Root Endpoint (Optional)
app.post('/', (req, res) => {
    res.status(200).send('Root Endpoint POST Request');
});

// Handle 404
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
