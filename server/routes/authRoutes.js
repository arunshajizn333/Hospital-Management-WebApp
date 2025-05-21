// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  loginDoctor,
  registerPatient,
  loginPatient,
  loginAdmin,
  changePassword
} = require('../controllers/authController');

// --- User Login Routes ---

/**
 * @route   POST /api/auth/doctor/login
 * @desc    Authenticate doctor and get token
 * @access  Public
 */
router.post('/doctor/login', loginDoctor);

/**
 * @route   POST /api/auth/patient/login
 * @desc    Authenticate patient and get token
 * @access  Public
 */
router.post('/patient/login', loginPatient);

/**
 * @route   POST /api/auth/admin/login
 * @desc    Authenticate admin & get token
 * @access  Public
 */
router.post('/admin/login', loginAdmin);

// --- Patient Registration ---

/**
 * @route   POST /api/auth/patient/register
 * @desc    Register a new patient
 * @access  Public
 */
router.post('/patient/register', registerPatient);

// --- Password Management ---

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password for authenticated user (Admin, Doctor, or Patient)
 * @access  Private (Authenticated User)
 */
router.put('/change-password', protect, changePassword);

module.exports = router;