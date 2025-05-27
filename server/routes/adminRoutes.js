// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Department Management by Admin ---
/**
 * @route   POST /api/admin/departments
 * @desc    Admin creates a new department
 * @access  Private (Admin)
 */
router.post('/departments', protect, authorize('admin'), adminController.createDepartment);

/**
 * @route   GET /api/admin/departments
 * @desc    Admin gets a list of all departments
 * @access  Private (Admin)
 */
router.get('/departments', protect, authorize('admin'), adminController.getDepartmentsForAdmin);

/**
 * @route   GET /api/admin/departments/:departmentId
 * @desc    Admin gets a single department by ID
 * @access  Private (Admin)
 */
router.get('/departments/:departmentId', protect, authorize('admin'), adminController.getDepartmentByIdForAdmin);

/**
 * @route   PUT /api/admin/departments/:departmentId
 * @desc    Admin updates a department
 * @access  Private (Admin)
 */
router.put('/departments/:departmentId', protect, authorize('admin'), adminController.updateDepartmentByAdmin);

/**
 * @route   DELETE /api/admin/departments/:departmentId
 * @desc    Admin deletes a department
 * @access  Private (Admin)
 */
router.delete('/departments/:departmentId', protect, authorize('admin'), adminController.deleteDepartmentByAdmin);


// --- Hospital Information Management by Admin ---
/**
 * @route   PUT /api/admin/hospital-info
 * @desc    Admin updates (or creates) the hospital information
 * @access  Private (Admin)
 */
router.put('/hospital-info', protect, authorize('admin'), adminController.updateHospitalInfoByAdmin);


// --- Callback Request Management by Admin ---
/**
 * @route   GET /api/admin/callbacks
 * @desc    Admin gets a list of all callback requests
 * @access  Private (Admin)
 */
router.get('/callbacks', protect, authorize('admin'), adminController.getCallbackRequestsByAdmin);

/**
 * @route   PUT /api/admin/callbacks/:callbackId/status
 * @desc    Admin updates the status of a callback request
 * @access  Private (Admin)
 */
router.put('/callbacks/:callbackId/status', protect, authorize('admin'), adminController.updateCallbackRequestStatusByAdmin);


// --- Contact Inquiry Management by Admin ---
/**
 * @route   GET /api/admin/contact-inquiries
 * @desc    Admin gets a list of all contact inquiries
 * @access  Private (Admin)
 */
router.get('/contact-inquiries', protect, authorize('admin'), adminController.getContactInquiriesByAdmin);

/**
 * @route   PUT /api/admin/contact-inquiries/:inquiryId/status
 * @desc    Admin updates the status of a contact inquiry
 * @access  Private (Admin)
 */
router.put('/contact-inquiries/:inquiryId/status', protect, authorize('admin'), adminController.updateContactInquiryStatusByAdmin);


// --- Admin Analytics Routes ---
/**
 * @route   GET /api/admin/analytics/patient-summary
 * @desc    Admin gets a summary of patient statistics
 * @access  Private (Admin)
 */
router.get('/analytics/patient-summary', protect, authorize('admin'), adminController.getPatientSummaryForAdmin);

/**
 * @route   GET /api/admin/analytics/doctor-appointment-summary
 * @desc    Admin gets a summary of appointment counts per doctor
 * @access  Private (Admin)
 */
router.get('/analytics/doctor-appointment-summary', protect, authorize('admin'), adminController.getDoctorAppointmentSummaryForAdmin);


// --- Doctor Management by Admin ---
// These routes use the functions in adminController.js which are designed for admin actions,
// including handling department assignments for doctors.

/**
 * @route   POST /api/admin/doctors
 * @desc    Admin creates a new doctor
 * @access  Private (Admin)
 */
router.post('/doctors', protect, authorize('admin'), adminController.createDoctorByAdmin);

/**
 * @route   GET /api/admin/doctors
 * @desc    Admin gets a list of all doctors
 * @access  Private (Admin)
 */
router.get('/doctors', protect, authorize('admin'), adminController.getDoctorsForAdmin);

/**
 * @route   GET /api/admin/doctors/:doctorId
 * @desc    Admin gets a single doctor by ID
 * @access  Private (Admin)
 */
router.get('/doctors/:doctorId', protect, authorize('admin'), adminController.getDoctorByIdForAdmin);

/**
 * @route   PUT /api/admin/doctors/:doctorId
 * @desc    Admin updates a doctor's details
 * @access  Private (Admin)
 */
router.put('/doctors/:doctorId', protect, authorize('admin'), adminController.updateDoctorByAdmin);

/**
 * @route   DELETE /api/admin/doctors/:doctorId
 * @desc    Admin deletes a doctor
 * @access  Private (Admin)
 */
router.delete('/doctors/:doctorId', protect, authorize('admin'), adminController.deleteDoctorByAdmin);

/**
 * @route   GET /api/admin/patients
 * @desc    Admin gets a list of all patients
 * @access  Private (Admin)
 */
router.get('/patients', protect, authorize('admin'), adminController.getAllPatientsForAdmin);

module.exports = router;