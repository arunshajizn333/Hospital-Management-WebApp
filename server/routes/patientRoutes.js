// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Patient's Own Actions ---
/**
 * @route   GET /api/patients/me/profile
 * @desc    Patient gets their own profile
 * @access  Private (Patient)
 */
router.get('/me/profile', protect, authorize('patient'), patientController.getMyPatientProfile);

/**
 * @route   PUT /api/patients/me/profile
 * @desc    Patient updates their own profile (non-medical info)
 * @access  Private (Patient)
 */
router.put('/me/profile', protect, authorize('patient'), patientController.updateMyPatientProfile);

/**
 * @route   GET /api/patients/me/medical-records
 * @desc    Patient views their own medical records summary/list
 * @access  Private (Patient)
 */
router.get('/me/medical-records', protect, authorize('patient'), patientController.getMyMedicalRecords);


// --- Doctor's Actions on Patients ---
// Note: For a real system, ensuring a doctor has a valid reason/relationship to access a patient is crucial.
// This might involve checking appointments, assignments, etc. For now, we'll allow any authenticated doctor
// to access patient data via these specific routes, assuming the frontend handles initial patient selection/search.

/**
 * @route   POST /api/patients
 * @desc    Doctor or Admin creates a new patient profile (e.g., for a walk-in not registered by themselves)
 * @access  Private (Doctor, Admin)
 */
router.post('/', protect, authorize('doctor', 'admin'), patientController.createPatientByAuthorizedUser);

/**
 * @route   GET /api/patients/doctor/:patientId/profile
 * @desc    Doctor views a specific patient's profile (including medical history)
 * @access  Private (Doctor)
 */
router.get('/doctor/:patientId/profile', protect, authorize('doctor'), patientController.getPatientProfileForDoctor);

/**
 * @route   PUT /api/patients/doctor/:patientId/profile
 * @desc    Doctor updates a patient's profile (primarily medical information or notes)
 * @access  Private (Doctor)
 */
router.put('/doctor/:patientId/profile', protect, authorize('doctor'), patientController.updatePatientProfileForDoctor);

/**
 * @route   POST /api/patients/doctor/:patientId/medical-records
 * @desc    Doctor adds a new medical record entry for a patient
 * @access  Private (Doctor)
 */
router.post('/doctor/:patientId/medical-records', protect, authorize('doctor'), patientController.addMedicalRecord);

/**
 * @route   GET /api/patients/doctor-search
 * @desc    Doctor searches for patients by name, email, or other criteria
 * @access  Private (Doctor)
 */
router.get('/doctor-search', protect, authorize('doctor'), patientController.searchPatientsForDoctor);


// --- Admin's Actions on Patients ---
/**
 * @route   GET /api/patients/admin/all
 * @desc    Admin gets a list of all patients
 * @access  Private (Admin)
 */
router.get('/admin/all', protect, authorize('admin'), patientController.listAllPatientsForAdmin);

/**
 * @route   GET /api/patients/admin/:patientId/profile
 * @desc    Admin views a specific patient's full profile
 * @access  Private (Admin)
 */
router.get('/admin/:patientId/profile', protect, authorize('admin'), patientController.getPatientByIdForAdmin);

// Future consideration: Admin ability to manage patient account status
// /**
//  * @route   PUT /api/patients/admin/:patientId/status
//  * @desc    Admin updates a patient's account status (e.g., activate/deactivate)
//  * @access  Private (Admin)
//  */
// router.put('/admin/:patientId/status', protect, authorize('admin'), patientController.updatePatientStatusByAdmin); // Controller function to be created

module.exports = router;