// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
// --- UPDATE THIS LINE TO INCLUDE loginAdmin ---
const { // <--- This destructures the import
  loginDoctor,
  registerPatient,
  loginPatient,
  loginAdmin,
  changePassword // 'changePassword' is imported here as a standalone function
} = require('../controllers/authController'); // All functions are imported from authController


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

router.put('/change-password', protect,changePassword);

module.exports = router;