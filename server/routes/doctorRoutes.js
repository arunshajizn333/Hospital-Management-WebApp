// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Existing Doctor Routes for Admin ---
// @route   POST api/doctors
// @desc    Register a new doctor (Admin action)
router.post('/', protect, authorize('admin'), doctorController.createDoctor);

// @route   GET api/doctors
// @desc    Get all doctors (can be public or admin-specific depending on what info is returned)
router.get('/', doctorController.getAllDoctors); // Consider if this needs protection/role for full details

// @route   GET api/doctors/:id
// @desc    Get a single doctor by ID (can be public or admin-specific)
router.get('/:id', doctorController.getDoctorById); // Consider protection for full details

// @route   PUT api/doctors/:id
// @desc    Update doctor details (Admin action)
router.put('/:id', protect, authorize('admin'), doctorController.updateDoctorById);

// @route   DELETE api/doctors/:id
// @desc    Delete a doctor (Admin action)
router.delete('/:id', protect, authorize('admin'), doctorController.deleteDoctorById);


// --- NEW: Doctor's Own Availability Management Routes ---

// @route   GET api/doctors/me/availability
// @desc    Doctor gets their own availability schedule
// @access  Private (Doctor)
router.get('/me/availability', protect, authorize('doctor'), doctorController.getDoctorAvailability);

// @route   PUT api/doctors/me/availability
// @desc    Doctor updates their own availability schedule
// @access  Private (Doctor)
router.put('/me/availability', protect, authorize('doctor'), doctorController.updateDoctorAvailability);

// --- Doctor's Own Availability Management Routes ---
router.get('/me/availability', protect, authorize('doctor'), doctorController.getDoctorAvailability);
router.put('/me/availability', protect, authorize('doctor'), doctorController.updateDoctorAvailability);



// --- NEW: Public route to get a doctor's available slots (for patients) ---
// This route logically fits here as it pertains to a specific doctor's availability
// but is accessed by patients/publicly.
// We will implement the controller for this after the doctor manages their schedule.
// @route   GET api/doctors/:doctorId/available-slots
// @desc    Get available appointment slots for a specific doctor on a given date
// @access  Public (or Patient)
// router.get('/:doctorId/available-slots', doctorController.getDoctorAvailableSlots);


module.exports = router;