// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Doctor's Own Availability Management ---

/**
 * @route   GET /api/doctors/me/availability
 * @desc    Doctor gets their own availability schedule and overrides
 * @access  Private (Doctor)
 */
router.get('/me/availability', protect, authorize('doctor'), doctorController.getDoctorAvailability);

/**
 * @route   PUT /api/doctors/me/availability
 * @desc    Doctor updates their own availability schedule and overrides
 * @access  Private (Doctor)
 */
router.put('/me/availability', protect, authorize('doctor'), doctorController.updateDoctorAvailability);


// --- Publicly Accessible Doctor Slot Information ---

/**
 * @route   GET /api/doctors/:doctorId/available-slots
 * @desc    Get available appointment slots for a specific doctor on a given date
 * @access  Public (or Patient, as it doesn't strictly need authentication to view slots)
 */
router.get('/:doctorId/available-slots', doctorController.getDoctorAvailableSlots);

// Optional: Routes for a doctor to manage their own profile details
// if there are aspects not covered by admin updates or the generic /api/auth/change-password
// /**
//  * @route   GET /api/doctors/me/profile
//  * @desc    Doctor gets their own profile details
//  * @access  Private (Doctor)
//  */
router.get('/me/profile', protect, authorize('doctor'), doctorController.getMyDoctorProfile);

// /**
//  * @route   PUT /api/doctors/me/profile
//  * @desc    Doctor updates their own profile details
//  * @access  Private (Doctor)
//  */
router.put('/me/profile', protect, authorize('doctor'), doctorController.updateMyDoctorProfile);

// --- NEW: Doctor's Patients List ---
/**
 * @route   GET /api/doctors/me/patients
 * @desc    Doctor gets a list of their patients
 * @access  Private (Doctor)
 */
router.get('/me/patients', protect, authorize('doctor'), doctorController.getMyPatients);



module.exports = router;