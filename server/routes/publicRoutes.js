// routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

/**
 * @route   GET /api/public/departments
 * @desc    Get a list of all active medical departments
 * @access  Public
 */
router.get('/departments', publicController.getAllDepartments);

// --- Public Doctor Information ---
/**
 * @route   GET /api/public/doctors
 * @desc    Get a list of doctors (public view) with optional filters and pagination
 * @access  Public
 */
router.get('/doctors', publicController.getPublicDoctorsList);

/**
 * @route   GET /api/public/doctors/featured
 * @desc    Get a list of featured doctors
 * @access  Public
 */
router.get('/doctors/featured', publicController.getFeaturedDoctors);

/**
 * @route   GET /api/public/doctors/:doctorId
 * @desc    Get public details of a specific doctor
 * @access  Public
 */
router.get('/doctors/:doctorId', publicController.getPublicDoctorProfile);

// --- General Hospital Information ---
/**
 * @route   GET /api/public/hospital-info
 * @desc    Get general hospital information and statistics
 * @access  Public
 */
router.get('/hospital-info', publicController.getHospitalInfo);

// --- Public Forms/Submissions ---
/**
 * @route   POST /api/public/callbacks
 * @desc    Submit a request for a callback
 * @access  Public
 */
router.post('/callbacks', publicController.handleCallbackRequest);

/**
 * @route   POST /api/public/contact-inquiries
 * @desc    Submit a general contact inquiry
 * @access  Public
 */
router.post('/contact-inquiries', publicController.handleContactInquiry);

module.exports = router;