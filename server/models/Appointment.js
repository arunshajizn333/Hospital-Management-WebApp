// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', // Refers to the Patient model
    required: [true, 'Patient ID is required for an appointment.'],
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',  // Refers to the Doctor model
    required: [true, 'Doctor ID is required for an appointment.'],
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required.'],
  },
  // Consider if you want to store time as a specific slot ID, a string, or part of the Date object.
  // Using a string for specific time slots like "09:00", "10:30" might be easier for now
  // if you have predefined slots.
  appointmentTime: {
    type: String, // e.g., "09:00", "14:30"
    required: [true, 'Appointment time slot is required.'],
    // You might want to add validation for the format of the time string
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason for appointment cannot exceed 500 characters.'],
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Scheduled',      // Patient booked, pending doctor confirmation (if applicable) or just booked.
      'Confirmed',      // Doctor confirmed (if your workflow needs this step).
      'Completed',      // Appointment took place.
      'CancelledByPatient',
      'CancelledByDoctor',
      'CancelledByAdmin',
      'NoShow'          // Patient did not show up.
    ],
    default: 'Scheduled',
  },
  // Optional notes
  patientNotes: { // Notes from patient during booking
    type: String,
    trim: true,
    maxlength: [500, 'Patient notes cannot exceed 500 characters.'],
  },
  doctorNotes: { // Notes added by the doctor post-appointment or during
    type: String,
    trim: true,
  },
  // Could also add fields for virtual appointment links, etc.
  // 'bookedBy' could be useful if Admins can also book for patients.
  // bookedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'bookedByType' },
  // bookedByType: { type: String, enum: ['Patient', 'Admin'] }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Indexing can improve query performance, e.g., for finding appointments by doctor and date
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;