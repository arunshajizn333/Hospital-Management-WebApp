// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Department Management by Admin ---
router.post('/departments', protect, authorize('admin'), adminController.createDepartment);
router.get('/departments', protect, authorize('admin'), adminController.getDepartmentsForAdmin);
router.get('/departments/:departmentId', protect, authorize('admin'), adminController.getDepartmentByIdForAdmin);
router.put('/departments/:departmentId', protect, authorize('admin'), adminController.updateDepartmentByAdmin);
router.delete('/departments/:departmentId', protect, authorize('admin'), adminController.deleteDepartmentByAdmin);

// --- Hospital Information Management by Admin ---
router.put('/hospital-info', protect, authorize('admin'), adminController.updateHospitalInfoByAdmin);

// --- Callback Request Management by Admin ---
router.get('/callbacks', protect, authorize('admin'), adminController.getCallbackRequestsByAdmin);
router.put('/callbacks/:callbackId/status', protect, authorize('admin'), adminController.updateCallbackRequestStatusByAdmin);

// --- Contact Inquiry Management by Admin ---
router.get('/contact-inquiries', protect, authorize('admin'), adminController.getContactInquiriesByAdmin);
router.put('/contact-inquiries/:inquiryId/status', protect, authorize('admin'), adminController.updateContactInquiryStatusByAdmin);

// --- Admin Analytics Routes ---
router.get('/analytics/patient-summary', protect, authorize('admin'), adminController.getPatientSummaryForAdmin);
router.get('/analytics/doctor-appointment-summary', protect, authorize('admin'), adminController.getDoctorAppointmentSummaryForAdmin);



// --- NEW/MOVED: Doctor Management by Admin ---
// These routes use the functions in adminController.js which are designed for admin actions,
// including handling department assignments for doctors.

// @route   POST /api/admin/doctors
// @desc    Admin creates a new doctor
// @access  Private (Admin)
router.post('/doctors', protect, authorize('admin'), adminController.createDoctorByAdmin);

// @route   GET /api/admin/doctors
// @desc    Admin gets a list of all doctors
// @access  Private (Admin)
router.get('/doctors', protect, authorize('admin'), adminController.getDoctorsForAdmin);

// @route   GET /api/admin/doctors/:doctorId
// @desc    Admin gets a single doctor by ID
// @access  Private (Admin)
router.get('/doctors/:doctorId', protect, authorize('admin'), adminController.getDoctorByIdForAdmin);

// @route   PUT /api/admin/doctors/:doctorId
// @desc    Admin updates a doctor's details
// @access  Private (Admin)
router.put('/doctors/:doctorId', protect, authorize('admin'), adminController.updateDoctorByAdmin);

// @route   DELETE /api/admin/doctors/:doctorId
// @desc    Admin deletes a doctor
// @access  Private (Admin)
router.delete('/doctors/:doctorId', protect, authorize('admin'), adminController.deleteDoctorByAdmin);


module.exports = router;