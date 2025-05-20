// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const mongoose = require('mongoose'); // For ObjectId validation

// @desc    Patient books a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id; // From 'protect' middleware
    const { doctorId, appointmentDate, appointmentTime, reason, patientNotes } = req.body;

    // --- 1. Validate Inputs ---
    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Doctor, appointment date, and time are required.' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid Doctor ID format.' });
    }
    if (!mongoose.Types.ObjectId.isValid(patientId)) { // Should be valid if from token
        return res.status(400).json({ message: 'Invalid Patient ID format.' });
    }

    // Check if Doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Selected doctor not found.' });
    }

    // Check if Patient (self) exists - good practice, though token implies user exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found.' });
    }
    
    // Validate appointmentDate is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison
    const inputAppointmentDate = new Date(appointmentDate);
    if (inputAppointmentDate < today) {
        return res.status(400).json({ message: 'Appointment date cannot be in the past.' });
    }

    // --- 2. Simplified Availability Check (Clash Detection) ---
    // Check if the doctor already has an appointment at the chosen date and time
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: inputAppointmentDate, // Ensure date is consistently handled
      appointmentTime: appointmentTime,
      status: { $in: ['Scheduled', 'Confirmed'] } // Check against active appointments
    });

    if (existingAppointment) {
      return res.status(409).json({ // 409 Conflict
        message: `Dr. ${doctor.name} is not available at ${appointmentTime} on ${inputAppointmentDate.toDateString()}. The slot is already booked.`,
      });
    }
    
    // --- 3. Create and Save Appointment ---
    const newAppointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      appointmentDate: inputAppointmentDate,
      appointmentTime,
      reason,
      patientNotes,
      status: 'Scheduled', // Default status
    });

    const savedAppointment = await newAppointment.save();

    // Populate patient and doctor details for the response
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
                                        .populate('patient', 'name email')
                                        .populate('doctor', 'name email specialization');

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointment: populatedAppointment,
    });

  } catch (error) {
    console.error('Error booking appointment:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error while booking appointment.' });
  }
};


// --- Placeholder for other controller functions (we'll fill these in next) ---

// @desc    Patient views their own upcoming and past appointments
// @route   GET /api/appointments/my
exports.getMyAppointmentsAsPatient = async (req, res) => {
  try {
    const patientId = req.user.id; // From 'protect' middleware

    // Optional query parameters for filtering and sorting
    const { status, sort } = req.query;

    const query = { patient: patientId };

    if (status) {
      // Ensure status is one of the allowed enum values if you want to be strict
      // For example: if (['Scheduled', 'Confirmed', 'Completed', ...].includes(status))
      query.status = status;
    }

    let sortOption = { appointmentDate: -1, appointmentTime: -1 }; // Default: newest first
    if (sort === 'upcoming') {
      query.appointmentDate = { $gte: new Date() }; // Only future or today's appointments
      sortOption = { appointmentDate: 1, appointmentTime: 1 }; // Oldest upcoming first
    } else if (sort === 'past') {
      query.appointmentDate = { $lt: new Date() }; // Only past appointments
      // sortOption remains newest past first by default, or you can change
    }


    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization email') // Populate doctor details
      .populate('patient', 'name email') // Populate patient details (useful for confirmation)
      .sort(sortOption);

    if (!appointments || appointments.length === 0) {
      return res.status(200).json({ message: 'You have no appointments matching your criteria.', appointments: [] });
    }

    res.status(200).json({
      count: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error('Error fetching patient appointments:', error.message);
    res.status(500).json({ message: 'Server Error while fetching appointments.' });
  }
};
// @desc    Patient updates/reschedules their own appointment
// @route   PUT /api/appointments/my/:appointmentId
exports.updateMyAppointmentAsPatient = async (req, res) => {
  try {
    const patientId = req.user.id; // From 'protect' middleware
    const { appointmentId } = req.params;
    const { appointmentDate, appointmentTime, reason, patientNotes } = req.body;

    // --- 1. Validate Appointment ID and Fetch Appointment ---
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid Appointment ID format.' });
    }

    let appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // --- 2. Authorization Check: Is this the patient's appointment? ---
    if (appointment.patient.toString() !== patientId) {
      return res.status(403).json({ message: 'Not authorized to update this appointment.' });
    }

    // --- 3. Status Check: Can this appointment be updated? ---
    if (['Completed', 'CancelledByPatient', 'CancelledByDoctor', 'CancelledByAdmin', 'NoShow'].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot update appointment with status: ${appointment.status}.` });
    }

    // --- 4. Handle Updates ---
    let slotChanged = false;
    const originalDoctorId = appointment.doctor; // Store original doctor for availability check

    if (appointmentDate) {
      const newAppDate = new Date(appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newAppDate < today) {
        return res.status(400).json({ message: 'New appointment date cannot be in the past.' });
      }
      if (appointment.appointmentDate.toISOString().split('T')[0] !== newAppDate.toISOString().split('T')[0]) {
          appointment.appointmentDate = newAppDate;
          slotChanged = true;
      }
    }

    if (appointmentTime) {
      // Add validation for time format if needed
      if (appointment.appointmentTime !== appointmentTime) {
        appointment.appointmentTime = appointmentTime;
        slotChanged = true;
      }
    }

    // --- 5. Re-check Availability if Date/Time Changed ---
    if (slotChanged) {
      const existingClash = await Appointment.findOne({
        doctor: originalDoctorId, // Check against the original doctor
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: { $in: ['Scheduled', 'Confirmed'] },
        _id: { $ne: appointmentId } // Exclude the current appointment itself from the clash check
      });

      if (existingClash) {
        return res.status(409).json({
          message: `The new slot at ${appointment.appointmentTime} on ${appointment.appointmentDate.toDateString()} is not available with the doctor.`,
        });
      }
      // If slot changed, you might want to revert status to 'Scheduled' or add a 'Rescheduled' status
      // For simplicity, we'll keep the current status unless explicitly changed by another field.
      // appointment.status = 'Scheduled'; // Or 'Rescheduled' if you add such a status
    }

    // Update other fields
    if (reason !== undefined) appointment.reason = reason;
    if (patientNotes !== undefined) appointment.patientNotes = patientNotes;

    const updatedAppointment = await appointment.save();

    // Populate for response
    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
                                        .populate('patient', 'name email')
                                        .populate('doctor', 'name email specialization');

    res.status(200).json({
      message: 'Appointment updated successfully!',
      appointment: populatedAppointment,
    });

  } catch (error) {
    console.error('Error updating patient appointment:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') { // For invalid appointmentId in params
        return res.status(400).json({ message: 'Invalid Appointment ID format.' });
    }
    res.status(500).json({ message: 'Server Error while updating appointment.' });
  }
};

// @desc    Patient cancels their own appointment
// @route   DELETE /api/appointments/my/:appointmentId
exports.cancelMyAppointmentAsPatient = async (req, res) => {
  try {
    const patientId = req.user.id; // From 'protect' middleware
    const { appointmentId } = req.params;

    // --- 1. Validate Appointment ID and Fetch Appointment ---
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid Appointment ID format.' });
    }

    let appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // --- 2. Authorization Check: Is this the patient's appointment? ---
    if (appointment.patient.toString() !== patientId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment.' });
    }

    // --- 3. Status Check: Can this appointment be cancelled by the patient? ---
    // Patients can typically cancel 'Scheduled' or 'Confirmed' appointments.
    // You might add time-based rules here (e.g., cannot cancel within 24 hours of appointment time).
    const cancellableStatuses = ['Scheduled', 'Confirmed'];
    if (!cancellableStatuses.includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot cancel appointment with status: '${appointment.status}'. It may be too late or already processed.`,
      });
    }

    // --- 4. Update Appointment Status ---
    appointment.status = 'CancelledByPatient';
    // Optionally, you could add a cancellation reason or timestamp if needed in your model.
    // appointment.cancellationReason = req.body.reason; (if you allow a reason)
    // appointment.cancelledAt = new Date();

    const updatedAppointment = await appointment.save();

    // Populate for response
    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
                                        .populate('patient', 'name email')
                                        .populate('doctor', 'name email specialization');

    res.status(200).json({
      message: 'Appointment cancelled successfully by patient.',
      appointment: populatedAppointment,
    });

  } catch (error) {
    console.error('Error cancelling patient appointment:', error.message);
    if (error.kind === 'ObjectId') { // For invalid appointmentId in params
        return res.status(400).json({ message: 'Invalid Appointment ID format.' });
    }
    res.status(500).json({ message: 'Server Error while cancelling appointment.' });
  }
};


// @desc    Doctor views their scheduled appointments
// @route   GET /api/appointments/doctor/my
exports.getMyAppointmentsAsDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id; // From 'protect' middleware, as doctor is logged in

    // Optional query parameters for filtering and sorting
    const { status, date, sort } = req.query; // 'date' can be YYYY-MM-DD

    const query = { doctor: doctorId };

    if (status) {
      query.status = status;
    }

    if (date) {
      // Filter by a specific date
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0); // Start of the day
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // End of the day
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    // Default sort: upcoming appointments first, then by time
    let sortOption = { appointmentDate: 1, appointmentTime: 1 };
    if (sort === 'recent') { // Or 'past' or however you want to define it
        sortOption = { appointmentDate: -1, appointmentTime: -1 };
    }
    // Add more sort options as needed


    const appointments = await Appointment.find(query)
      .populate('patient', 'name email contact.phone dateOfBirth gender') // Populate patient details
      .populate('doctor', 'name email specialization') // Populate own doctor details (could be omitted if not needed in response for doctor's own view)
      .sort(sortOption);

    if (!appointments || appointments.length === 0) {
      return res.status(200).json({ message: 'You have no appointments matching your criteria.', appointments: [] });
    }

    res.status(200).json({
      count: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error("Error fetching doctor's appointments:", error.message);
    res.status(500).json({ message: 'Server Error while fetching appointments.' });
  }
};

// @desc    Doctor updates an appointment's status
// @route   PUT /api/appointments/doctor/:appointmentId/status
exports.updateAppointmentStatusAsDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id; // Logged-in doctor
    const { appointmentId } = req.params;
    const { status, doctorNotes } = req.body; // New status and optional notes from doctor

    // --- 1. Validate Input & Fetch Appointment ---
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid Appointment ID format.' });
    }

    if (!status) {
      return res.status(400).json({ message: 'New status is required.' });
    }

    // Validate the provided status against the schema's enum values
    const allowedStatuses = Appointment.schema.path('status').enumValues;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status value. Allowed statuses are: ${allowedStatuses.join(', ')}` });
    }

    let appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // --- 2. Authorization Check: Is this appointment for the logged-in doctor? ---
    if (appointment.doctor.toString() !== doctorId) {
      return res.status(403).json({ message: 'Not authorized to update this appointment.' });
    }

    // --- 3. Business Logic for Status Transitions (Optional - for more complex rules) ---
    // For example, you might not want to change status from 'Completed' or 'Cancelled' without specific logic.
    const terminalStatuses = ['Completed', 'CancelledByPatient', 'CancelledByDoctor', 'CancelledByAdmin', 'NoShow'];
    if (terminalStatuses.includes(appointment.status) && appointment.status !== status) {
        // Allow changing notes on a terminal status, but not necessarily the status itself back to an active one without more logic.
        // For now, we'll allow updating status to another terminal one, e.g. Scheduled -> NoShow.
        // If changing FROM a terminal status TO a non-terminal one, it might need special handling.
        // Let's keep it simple: if it's already in a terminal state, only allow changing notes or to another terminal state.
        if (!terminalStatuses.includes(status)) { // Trying to move from terminal to non-terminal
             return res.status(400).json({ message: `Cannot change status from '${appointment.status}' to '${status}'.` });
        }
    }
    // If doctor is confirming a 'Scheduled' appointment
    if (appointment.status === 'Scheduled' && status === 'Confirmed') {
        // Potentially trigger notifications here
    }
    // If doctor is completing an appointment
    if (status === 'Completed' && appointment.status !== 'Completed') {
        // Update doctor notes if provided
        // Potentially trigger follow-up actions or billing
    }


    // --- 4. Update Appointment ---
    appointment.status = status;
    if (doctorNotes !== undefined) { // Allow updating notes even if status is the same
      appointment.doctorNotes = doctorNotes;
    }

    const updatedAppointment = await appointment.save();

    // Populate for response
    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
                                        .populate('patient', 'name email')
                                        .populate('doctor', 'name email specialization');

    res.status(200).json({
      message: `Appointment status updated to '${status}'.`,
      appointment: populatedAppointment,
    });

  } catch (error) {
    console.error("Error updating appointment status by doctor:", error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Appointment ID format.' });
    }
    res.status(500).json({ message: 'Server Error while updating appointment status.' });
  }
};

// @desc    Admin views all appointments in the system
// @route   GET /api/appointments/admin/all
exports.getAllAppointmentsAsAdmin = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10; // Default 10 per page
    const skip = (page - 1) * limit;

    // Filters
    const { doctorId, patientId, status, dateFrom, dateTo } = req.query;
    const query = {};

    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid Doctor ID format for filter.' });
      }
      query.doctor = doctorId;
    }
    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid Patient ID format for filter.' });
      }
      query.patient = patientId;
    }
    if (status) {
      const allowedStatuses = Appointment.schema.path('status').enumValues;
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status filter. Allowed: ${allowedStatuses.join(', ')}` });
      }
      query.status = status;
    }
    if (dateFrom || dateTo) {
      query.appointmentDate = {};
      if (dateFrom) {
        // Potentially add validation for dateFrom format
        query.appointmentDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Potentially add validation for dateTo format
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // Include the whole 'dateTo' day
        query.appointmentDate.$lte = endDate;
      }
    }

    // Sorting (default: newest first)
    let sortOption = { createdAt: -1 }; // Or appointmentDate: -1
    if (req.query.sort) {
        if (req.query.sort === 'date_asc') sortOption = { appointmentDate: 1, appointmentTime: 1 };
        if (req.query.sort === 'date_desc') sortOption = { appointmentDate: -1, appointmentTime: -1 };
    }

    const totalAppointments = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email specialization')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: 'Appointments retrieved successfully.',
      count: appointments.length,
      total: totalAppointments,
      currentPage: page,
      totalPages: Math.ceil(totalAppointments / limit),
      appointments,
    });

  } catch (error) {
    console.error("Error fetching all appointments for admin:", error.message);
    res.status(500).json({ message: 'Server Error while fetching appointments.' });
  }
};

// @desc    Admin manages/updates any appointment
// @route   PUT /api/appointments/admin/:appointmentId/manage
exports.manageAppointmentAsAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const {
      patientId, // Admin might reassign appointment to a different patient
      doctorId,  // Admin might reassign appointment to a different doctor
      appointmentDate,
      appointmentTime,
      reason,
      status,
      patientNotes,
      doctorNotes
    } = req.body;

    // --- 1. Validate Appointment ID and Fetch Appointment ---
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid Appointment ID format.' });
    }

    let appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // --- 2. Prepare Update Data & Perform Validations ---
    const updates = {};
    let slotChanged = false;
    let doctorForAvailabilityCheck = appointment.doctor; // Start with current doctor

    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid Patient ID format provided.' });
      }
      const patientExists = await Patient.findById(patientId);
      if (!patientExists) return res.status(404).json({ message: 'New patient ID not found.' });
      updates.patient = patientId;
    }

    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid Doctor ID format provided.' });
      }
      const doctorExists = await Doctor.findById(doctorId);
      if (!doctorExists) return res.status(404).json({ message: 'New doctor ID not found.' });
      if (appointment.doctor.toString() !== doctorId) {
        updates.doctor = doctorId;
        doctorForAvailabilityCheck = doctorId; // Check availability for the new doctor
        slotChanged = true; // If doctor changes, the slot's availability for the new doctor matters
      }
    }

    let dateForAvailabilityCheck = appointment.appointmentDate;
    if (appointmentDate) {
      const newAppDate = new Date(appointmentDate);
      const today = new Date(); // For past date check if it's a new date
      today.setHours(0, 0, 0, 0); 
      if (newAppDate < today && newAppDate.toISOString().split('T')[0] !== appointment.appointmentDate.toISOString().split('T')[0] ) { // only check if date is truly changing to past
          return res.status(400).json({ message: 'New appointment date cannot be in the past.' });
      }
      if (appointment.appointmentDate.toISOString().split('T')[0] !== newAppDate.toISOString().split('T')[0]) {
        updates.appointmentDate = newAppDate;
        dateForAvailabilityCheck = newAppDate;
        slotChanged = true;
      }
    }
    
    let timeForAvailabilityCheck = appointment.appointmentTime;
    if (appointmentTime) {
      // Add validation for time format if desired
      if (appointment.appointmentTime !== appointmentTime) {
        updates.appointmentTime = appointmentTime;
        timeForAvailabilityCheck = appointmentTime;
        slotChanged = true;
      }
    }

    // --- 3. Re-check Availability if Doctor, Date, or Time Changed ---
    if (slotChanged) {
      const existingClash = await Appointment.findOne({
        doctor: doctorForAvailabilityCheck,
        appointmentDate: dateForAvailabilityCheck,
        appointmentTime: timeForAvailabilityCheck,
        status: { $in: ['Scheduled', 'Confirmed'] },
        _id: { $ne: appointmentId } // Exclude the current appointment
      });

      if (existingClash) {
        const conflictingDoctor = await Doctor.findById(doctorForAvailabilityCheck).select('name');
        return res.status(409).json({
          message: `The slot at ${timeForAvailabilityCheck} on ${new Date(dateForAvailabilityCheck).toDateString()} is not available with Dr. ${conflictingDoctor ? conflictingDoctor.name : 'the selected doctor'}.`,
        });
      }
    }

    if (status) {
      const allowedStatuses = Appointment.schema.path('status').enumValues;
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status value. Allowed: ${allowedStatuses.join(', ')}` });
      }
      updates.status = status;
    }

    // Update other fields directly
    if (reason !== undefined) updates.reason = reason;
    if (patientNotes !== undefined) updates.patientNotes = patientNotes;
    if (doctorNotes !== undefined) updates.doctorNotes = doctorNotes;

    // --- 4. Apply Updates and Save ---
    // Mongoose findByIdAndUpdate can also be used here.
    // Using save() allows more complex pre-save hooks if needed later.
    Object.assign(appointment, updates); // Apply all collected updates
    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
                                        .populate('patient', 'name email')
                                        .populate('doctor', 'name email specialization');

    res.status(200).json({
      message: 'Appointment updated successfully by admin.',
      appointment: populatedAppointment,
    });

  } catch (error) {
    console.error("Error managing appointment by admin:", error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid ID format in request.' });
    }
    res.status(500).json({ message: 'Server Error while managing appointment.' });
  }
};

// @desc    View details of a specific appointment
// @route   GET /api/appointments/:appointmentId
exports.getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const user = req.user; // User object from 'protect' middleware (has id and role)

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid Appointment ID format.' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email contact.phone') // Populate necessary patient fields
      .populate('doctor', 'name email specialization');  // Populate necessary doctor fields

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // --- Authorization Check ---
    let isAuthorized = false;

    if (user.role === 'admin') {
      isAuthorized = true;
    } else if (user.role === 'doctor' && appointment.doctor._id.toString() === user.id) {
      isAuthorized = true;
    } else if (user.role === 'patient' && appointment.patient._id.toString() === user.id) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'You are not authorized to view this appointment.' });
    }

    res.status(200).json({ appointment });

  } catch (error) {
    console.error("Error fetching appointment by ID:", error.message);
    if (error.kind === 'ObjectId') { // For invalid appointmentId in params during DB query
        return res.status(400).json({ message: 'Invalid Appointment ID format.' });
    }
    res.status(500).json({ message: 'Server Error while fetching appointment.' });
  }
};