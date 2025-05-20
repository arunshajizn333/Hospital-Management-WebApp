// controllers/authController.js
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin'); // --- ADD THIS LINE: Import the Admin model ---
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Utility function to generate JWT (can be shared)
const generateToken = (id, role, expiresIn = '1h') => { // Added default expiresIn
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

// --- DOCTOR LOGIN ---
exports.loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Use doctor.role from DB, default to 'doctor' if not present (though schema has default)
    const token = generateToken(doctor._id, doctor.role || 'doctor', '7d'); // Doctors might need longer sessions
    res.status(200).json({
      message: 'Doctor login successful',
      token,
      user: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        role: doctor.role || 'doctor'
      },
    });
  } catch (err) {
    console.error('Doctor login error:', err.message);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// --- PATIENT REGISTRATION ---
exports.registerPatient = async (req, res) => {
  const { name, email, password, dateOfBirth, gender, contact } = req.body;
  try {
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    let patient = await Patient.findOne({ email });
    if (patient) {
      return res.status(400).json({ message: 'Patient with this email already exists' });
    }
    patient = new Patient({
      name, email, password, dateOfBirth, gender, contact
    });
    await patient.save();
    const token = generateToken(patient._id, 'patient'); // Default expiry '1h'
    res.status(201).json({
      message: 'Patient registered successfully',
      token,
      user: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        role: 'patient'
      },
    });
  } catch (err) {
    console.error('Patient registration error:', err.message);
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// --- PATIENT LOGIN ---
exports.loginPatient = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const patient = await Patient.findOne({ email }).select('+password');
    if (!patient) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(patient._id, 'patient'); // Default expiry '1h'
    res.status(200).json({
      message: 'Patient login successful',
      token,
      user: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        role: 'patient'
      },
    });
  } catch (err) {
    console.error('Patient login error:', err.message);
    res.status(500).json({ message: 'Server Error during login' });
  }
};


// --- NEW ADMIN LOGIN FUNCTION ---
// @desc    Authenticate admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email & password were provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide admin email and password' });
    }

    // Check for admin and explicitly select password
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      // Use a generic message for security (don't reveal if email exists or not)
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password); // Method from Admin model

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Admin authenticated, generate token
    // Admin role is fixed as 'admin' in the Admin model's schema
    const token = generateToken(admin._id, admin.role, '8h'); // Admins might have longer sessions

    // Send token and admin info (excluding password)
    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: { // Consistent 'user' object in response
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role // Will be 'admin'
      },
    });

  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ message: 'Server Error during admin login' });
  }
};