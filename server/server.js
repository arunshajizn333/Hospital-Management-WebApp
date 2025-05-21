// server.js

// Core Dependencies
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app = express();

// Core Middleware Setup
app.use(helmet()); // Applies various security-related HTTP headers
app.use(cors());   // Enables Cross-Origin Resource Sharing
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: false })); // Parses incoming requests with URL-encoded payloads

// API Route Mounting
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Define Port and Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});