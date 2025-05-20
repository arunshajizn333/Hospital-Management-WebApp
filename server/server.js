// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet'); // --- ADD THIS LINE ---
const connectDB = require('./config/db');



// Import Routers
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

// (If you were using AppError and errorHandler, their imports would be here)
// const AppError = require('./utils/appError');
// const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();
const app = express();

// Core Middleware
app.use(helmet()); // --- ADD THIS LINE to use helmet's default security headers ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- API Routes ---
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 Handling (if you re-add it, or your preferred method) ---
// app.use((req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// --- Global Error Handling Middleware (if you re-add it) ---
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});