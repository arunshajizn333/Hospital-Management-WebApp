// controllers/doctorController.js
const Doctor = require('../models/Doctor'); // Import the Doctor model
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const Department = require('../models/Department');
// @desc    Register/Create a new doctor
// @route   POST /api/doctors
// @access  Private (initially Admin)
exports.createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, phone, availabilityNotes } = req.body;

    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    doctor = new Doctor({
      name,
      email,
      password,
      specialization,
      phone,
      availabilityNotes,
    });

    const newDoctor = await doctor.save();
    const doctorResponse = {
        _id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        specialization: newDoctor.specialization,
        phone: newDoctor.phone,
        availabilityNotes: newDoctor.availabilityNotes,
        createdAt: newDoctor.createdAt
    };
    res.status(201).json({ message: 'Doctor registered successfully', doctor: doctorResponse });

  } catch (err) {
    console.error('Error creating doctor:', err.message);
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error while creating doctor' });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public (or Private/Admin)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find(); // Password excluded by default due to `select: false`
    res.status(200).json({ doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err.message);
    res.status(500).json({ message: 'Server Error while fetching doctors' });
  }
};

// --- NEW CONTROLLER FUNCTIONS ---

// @desc    Get a single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public (or Private/Admin)
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id); // Password excluded by default

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json({ doctor });
  } catch (err) {
    console.error('Error fetching doctor by ID:', err.message);
    if (err.kind === 'ObjectId') { // Handle invalid ObjectId format
        return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    res.status(500).json({ message: 'Server Error while fetching doctor' });
  }
};

// @desc    Update doctor profile by ID (Admin action primarily)
// @route   PUT /api/doctors/:id
// @access  Private (Admin)
exports.updateDoctorById = async (req, res) => {
  try {
    const { name, email, specialization, phone, availabilityNotes } = req.body;

    // Fields to update (excluding password for this general update, password change should be separate)
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email; // Consider implications if email is unique and needs verification
    if (specialization) updateFields.specialization = specialization;
    if (phone) updateFields.phone = phone;
    if (availabilityNotes) updateFields.availabilityNotes = availabilityNotes;

    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if email is being changed and if the new email already exists for another doctor
    if (email && email !== doctor.email) {
        const existingDoctorWithNewEmail = await Doctor.findOne({ email });
        if (existingDoctorWithNewEmail) {
            return res.status(400).json({ message: 'This email is already in use by another doctor.' });
        }
    }

    doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true } // `new: true` returns the modified document
                                         // `runValidators: true` ensures schema validations are run
    );

    // Explicitly create response object to ensure password is not sent, even if findByIdAndUpdate returned it
    const doctorResponse = {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        phone: doctor.phone,
        availabilityNotes: doctor.availabilityNotes,
        updatedAt: doctor.updatedAt
    };

    res.status(200).json({ message: 'Doctor profile updated successfully', doctor: doctorResponse });

  } catch (err) {
    console.error('Error updating doctor:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    // Handle potential duplicate key error for email if not caught above explicitly
    if (err.code === 11000 && err.keyValue && err.keyValue.email) {
        return res.status(400).json({ message: `Email '${err.keyValue.email}' is already in use.` });
    }
    res.status(500).json({ message: 'Server Error while updating doctor' });
  }
};

// @desc    Delete a doctor by ID (Admin action)
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
exports.deleteDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await Doctor.findByIdAndDelete(req.params.id);
    // or await doctor.remove(); // if you fetched the document first

    res.status(200).json({ message: 'Doctor profile deleted successfully' });

  } catch (err) {
    console.error('Error deleting doctor:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    res.status(500).json({ message: 'Server Error while deleting doctor' });
  }
};

// --- NEW: Doctor's Own Availability Management Functions ---

// @desc    Doctor gets their own availability schedule
// @route   GET /api/doctors/me/availability
// @access  Private (Doctor)
exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('availabilitySchedule name');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json({
      message: "Doctor's availability schedule retrieved successfully.",
      availabilitySchedule: doctor.availabilitySchedule,
      doctorName: doctor.name // Optional: good for frontend display
    });

  } catch (error) {
    console.error("Error fetching doctor's availability:", error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Doctor updates their own availability schedule
// @route   PUT /api/doctors/me/availability
// @access  Private (Doctor)
exports.updateDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { availabilitySchedule, availabilityOverrides } = req.body; // Expect both potentially

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Update weekly schedule if provided
    if (availabilitySchedule !== undefined) {
      if (!Array.isArray(availabilitySchedule)) {
        return res.status(400).json({ message: 'availabilitySchedule must be an array.' });
      }
      // Basic validation (e.g., 7 days) could be done here, but schema handles detailed structure
      doctor.availabilitySchedule = availabilitySchedule;
    }

    // Update date-specific overrides if provided
    if (availabilityOverrides !== undefined) {
      if (!Array.isArray(availabilityOverrides)) {
        return res.status(400).json({ message: 'availabilityOverrides must be an array.' });
      }
      // Ensure dates in overrides are unique for this doctor to prevent conflicting rules for the same date.
      // This validation is better handled here or in a pre-save hook for overrides if they become complex.
      // For now, Mongoose schema validation will handle individual override object structures.
      // A simple check for date uniqueness within the provided array:
      if (availabilityOverrides.length > 0) {
        const overrideDates = availabilityOverrides.map(ov => new Date(ov.date).toISOString().split('T')[0]);
        const uniqueOverrideDates = new Set(overrideDates);
        if (overrideDates.length !== uniqueOverrideDates.size) {
            return res.status(400).json({ message: 'Dates in availabilityOverrides must be unique.' });
        }
      }
      doctor.availabilityOverrides = availabilityOverrides;
    }
    
    // If neither is provided, but the request is made
    if (availabilitySchedule === undefined && availabilityOverrides === undefined) {
        return res.status(400).json({ message: 'Please provide availabilitySchedule and/or availabilityOverrides to update.' });
    }

    await doctor.save(); // This will trigger Mongoose schema validations for all sub-documents

    res.status(200).json({
      message: "Doctor's availability updated successfully.",
      availabilitySchedule: doctor.availabilitySchedule,
      availabilityOverrides: doctor.availabilityOverrides,
    });

  } catch (error) {
    console.error("Error updating doctor's availability:", error.message);
    if (error.name === 'ValidationError') {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ message: 'Validation failed.', errors });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Helper function to convert HH:MM string to total minutes from midnight ---
const timeToMinutes = (timeStr) => { // "HH:MM"
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return 0; // Basic validation
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// --- Helper function to convert total minutes from midnight to HH:MM string ---
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};


// @desc    Get available appointment slots for a specific doctor on a given date
// @route   GET /api/doctors/:doctorId/available-slots?date=YYYY-MM-DD
// @access  Public (or Patient)
exports.getDoctorAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid Doctor ID format.' });
    }
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD).' });
    }

    // Validate date format (basic)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
    }

    const requestedDate = new Date(date);
    requestedDate.setHours(0,0,0,0); // Normalize to start of day for comparison

    const today = new Date();
    today.setHours(0,0,0,0);

    if (requestedDate < today) {
        return res.status(400).json({ message: 'Cannot fetch slots for a past date.' });
    }

    const doctor = await Doctor.findById(doctorId).select('availabilitySchedule name');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Determine day of the week for the requestedDate (0 for Sunday, 1 for Monday, etc.)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const requestedDayName = dayNames[requestedDate.getDay()];

    const dailySchedule = doctor.availabilitySchedule.find(
      (d) => d.dayOfWeek === requestedDayName && d.isAvailable
    );

    if (!dailySchedule) {
      return res.status(200).json({
        message: `Dr. ${doctor.name} is not available on ${requestedDate.toDateString()}.`,
        availableSlots: [],
      });
    }

    const { startTime, endTime, slotDurationMinutes, breakTimes } = dailySchedule;

    // Convert times to minutes for easier calculation
    const workStartMinutes = timeToMinutes(startTime);
    const workEndMinutes = timeToMinutes(endTime);
    const slotDuration = slotDurationMinutes;

    // Fetch existing appointments for this doctor on the requested date
    const appointmentsOnDate = await Appointment.find({
      doctor: doctorId,
      appointmentDate: requestedDate, // Mongoose will handle date comparison correctly
      status: { $in: ['Scheduled', 'Confirmed'] }, // Consider only active appointments
    }).select('appointmentTime');

    const bookedSlots = appointmentsOnDate.map(apt => apt.appointmentTime); // ["09:00", "10:30"]

    const availableSlots = [];
    let currentSlotStartMinutes = workStartMinutes;

    while (currentSlotStartMinutes + slotDuration <= workEndMinutes) {
      const currentSlotEndMinutes = currentSlotStartMinutes + slotDuration;
      const slotTimeStr = minutesToTime(currentSlotStartMinutes);

      // Check 1: Is the slot in the past (if requestedDate is today)?
      let isPastSlot = false;
      if (requestedDate.getTime() === today.getTime()) { // Check if it's today
          const now = new Date();
          const slotDateTime = new Date(requestedDate);
          const [slotHours, slotMinutes] = slotTimeStr.split(':').map(Number);
          slotDateTime.setHours(slotHours, slotMinutes, 0, 0);
          if (slotDateTime < now) {
              isPastSlot = true;
          }
      }

      // Check 2: Is the slot booked?
      const isBooked = bookedSlots.includes(slotTimeStr);

      // Check 3: Does the slot fall within any break time?
      let isInBreak = false;
      if (breakTimes && breakTimes.length > 0) {
        for (const breakPeriod of breakTimes) {
          const breakStartMinutes = timeToMinutes(breakPeriod.breakStart);
          const breakEndMinutes = timeToMinutes(breakPeriod.breakEnd);
          // Check if slot overlaps with break:
          // (slotStart < breakEnd) and (slotEnd > breakStart)
          if (currentSlotStartMinutes < breakEndMinutes && currentSlotEndMinutes > breakStartMinutes) {
            isInBreak = true;
            break;
          }
        }
      }

      if (!isBooked && !isInBreak && !isPastSlot) {
        availableSlots.push(slotTimeStr);
      }

      currentSlotStartMinutes += slotDuration; // Move to the next potential slot
    }

    res.status(200).json({
      message: `Available slots for Dr. ${doctor.name} on ${requestedDate.toDateString()}:`,
      date: requestedDate.toISOString().split('T')[0],
      dayOfWeek: requestedDayName,
      availableSlots,
    });

  } catch (error) {
    console.error("Error fetching doctor's available slots:", error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Doctor gets their own availability schedule and overrides
// @route   GET /api/doctors/me/availability
// @access  Private (Doctor)
exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id)
      .select('name availabilitySchedule availabilityOverrides'); // Select both fields

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json({
      message: "Doctor's availability retrieved successfully.",
      doctorName: doctor.name, // Optional: good for frontend display
      availabilitySchedule: doctor.availabilitySchedule,
      availabilityOverrides: doctor.availabilityOverrides,
    });

  } catch (error) {
    console.error("Error fetching doctor's availability:", error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
/**
 * @desc    Doctor gets their own profile details
 * @route   GET /api/doctors/me/profile
 * @access  Private (Doctor)
 */
exports.getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id)
      .select('-password -isAdminControlled') // Exclude sensitive/internal fields
      .populate('department', 'name description'); // Populate department details

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor's own profile:", error.message);
    res.status(500).json({ message: "Server Error fetching profile." });
  }
};

/**
 * @desc    Doctor updates their own profile details
 * @route   PUT /api/doctors/me/profile
 * @access  Private (Doctor)
 */
exports.updateMyDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    // Fields a doctor might be allowed to update themselves:
    const { phone, publicBio, photoUrl /* any other doctor-editable fields */ } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Update allowed fields
    if (phone !== undefined) doctor.phone = phone;
    if (publicBio !== undefined) doctor.publicBio = publicBio;
    if (photoUrl !== undefined) doctor.photoUrl = photoUrl;
    // Note: Name, email, specialization, department, role are typically admin-managed.
    // If doctors can change their email, add uniqueness check and potentially re-verification flow.

    const updatedDoctor = await doctor.save();

    // Prepare response, excluding sensitive fields
    const doctorResponse = updatedDoctor.toObject();
    delete doctorResponse.password;
    delete doctorResponse.isAdminControlled;
    // If department was an ObjectId and not populated by save, re-populate or structure response
    // However, findByIdAndUpdate with {new: true} and populate is also an option.
    // For save(), we might need to re-fetch and populate if we need the populated department in response.
    // For simplicity, let's return the updated doctor and frontend can re-fetch if needed or use stored department name.

    const populatedDoctor = await Doctor.findById(updatedDoctor._id)
                                .select('-password -isAdminControlled')
                                .populate('department', 'name description');


    res.status(200).json({
      message: 'Profile updated successfully.',
      doctor: populatedDoctor
    });

  } catch (error) {
    console.error("Error updating doctor's own profile:", error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error updating profile.' });
  }
};

/**
 * @desc    Doctor gets a list of their patients (based on appointments)
 * @route   GET /api/doctors/me/patients
 * @access  Private (Doctor)
 */
exports.getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Search query (e.g., by patient name)
    const searchQuery = req.query.search;

    // 1. Find all unique patient IDs from appointments associated with this doctor
    const patientIdsFromAppointments = await Appointment.distinct('patient', { doctor: doctorId });

    if (patientIdsFromAppointments.length === 0) {
      return res.status(200).json({
        message: 'No patients found associated with your appointments.',
        count: 0,
        total: 0,
        currentPage: 1,
        totalPages: 0,
        patients: [],
      });
    }

    // 2. Build query to fetch these patients, with optional name search
    const patientQuery = {
      _id: { $in: patientIdsFromAppointments },
    };

    if (searchQuery) {
      patientQuery.name = { $regex: new RegExp(searchQuery, 'i') };
    }

    // 3. Fetch patient details with pagination
    const totalPatients = await Patient.countDocuments(patientQuery);
    const patients = await Patient.find(patientQuery)
      .select('name email dateOfBirth gender contact.phone') // Select fields needed for the list view
      .sort({ name: 1 }) // Sort by name
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: 'Patients retrieved successfully.',
      count: patients.length,
      total: totalPatients,
      currentPage: page,
      totalPages: Math.ceil(totalPatients / limit),
      patients,
    });

  } catch (error) {
    console.error("Error fetching doctor's patients:", error.message);
    res.status(500).json({ message: "Server Error fetching patients." });
  }
};