// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController'); // We'll create this next
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Patient's Appointment Actions ---

// @route   POST api/appointments
// @desc    Patient books a new appointment
// @access  Private (Patient)
router.post('/', protect, authorize('patient'), appointmentController.bookAppointment);

// @route   GET api/appointments/my
// @desc    Patient views their own upcoming and past appointments
// @access  Private (Patient)
router.get('/my', protect, authorize('patient'), appointmentController.getMyAppointmentsAsPatient);

// @route   PUT api/appointments/my/:appointmentId
// @desc    Patient updates/reschedules their own appointment (if allowed)
// @access  Private (Patient)
router.put('/my/:appointmentId', protect, authorize('patient'), appointmentController.updateMyAppointmentAsPatient);

// @route   DELETE api/appointments/my/:appointmentId
// @desc    Patient cancels their own appointment
// @access  Private (Patient)
router.delete('/my/:appointmentId', protect, authorize('patient'), appointmentController.cancelMyAppointmentAsPatient);


// --- Doctor's Appointment Actions ---

// @route   GET api/appointments/doctor/my
// @desc    Doctor views their scheduled appointments
// @access  Private (Doctor)
router.get('/doctor/my', protect, authorize('doctor'), appointmentController.getMyAppointmentsAsDoctor);

// @route   PUT api/appointments/doctor/:appointmentId/status
// @desc    Doctor updates an appointment's status (e.g., Confirmed, Completed, NoShow)
// @access  Private (Doctor)
router.put('/doctor/:appointmentId/status', protect, authorize('doctor'), appointmentController.updateAppointmentStatusAsDoctor);


// --- Admin's Appointment Actions ---

// @route   GET api/appointments/admin/all
// @desc    Admin views all appointments in the system (with filters)
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), appointmentController.getAllAppointmentsAsAdmin);

// @route   PUT api/appointments/admin/:appointmentId/manage
// @desc    Admin manages/updates any appointment (e.g., reschedule, change details, cancel)
// @access  Private (Admin)
router.put('/admin/:appointmentId/manage', protect, authorize('admin'), appointmentController.manageAppointmentAsAdmin);

// @route   DELETE api/appointments/admin/:appointmentId/manage
// @desc    Admin cancels/deletes any appointment
// @access  Private (Admin)
// router.delete('/admin/:appointmentId/manage', protect, authorize('admin'), appointmentController.deleteAppointmentAsAdmin); // Add if needed


// --- Shared Appointment Action (View Specific Appointment) ---

// @route   GET api/appointments/:appointmentId
// @desc    View details of a specific appointment
// @access  Private (Patient (own), Doctor (related), Admin)
router.get('/:appointmentId', protect, appointmentController.getAppointmentById);


module.exports = router;