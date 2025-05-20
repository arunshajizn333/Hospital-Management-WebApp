// routes/authRoutes.js
const express = require('express');
const router = express.Router();
// --- UPDATE THIS LINE TO INCLUDE loginAdmin ---
const {
  loginDoctor,
  registerPatient,
  loginPatient,
  loginAdmin // Add loginAdmin here
} = require('../controllers/authController');

// Doctor Login
router.post('/doctor/login', loginDoctor);

// Patient Registration
router.post('/patient/register', registerPatient);

// Patient Login
router.post('/patient/login', loginPatient);

// --- ADD THIS ROUTE FOR ADMIN LOGIN ---
// @route   POST api/auth/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/admin/login', loginAdmin);

module.exports = router;