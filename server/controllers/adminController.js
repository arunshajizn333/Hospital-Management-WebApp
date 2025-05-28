// controllers/adminController.js
const Department = require('../models/Department');
const HospitalInfo = require('../models/HospitalInfo');
const CallbackRequest = require('../models/CallbackRequest');
const ContactInquiry = require('../models/ContactInquiry');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor'); // Crucial for Doctor Management
const mongoose = require('mongoose');

// --- Department Management by Admin ---
// @desc    Admin creates a new department
// @route   POST /api/admin/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, imageUrl, servicesOffered } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Department name is required.' });
    }
    const existingDepartment = await Department.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    if (existingDepartment) {
      return res.status(400).json({ message: `Department with name '${name}' already exists.` });
    }
    const newDepartment = new Department({
      name, description, imageUrl, servicesOffered
    });
    const savedDepartment = await newDepartment.save();
    res.status(201).json({
      message: 'Department created successfully.',
      department: savedDepartment,
    });
  } catch (error) {
    console.error('Error creating department by admin:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
        return res.status(400).json({ message: `Department with name '${error.keyValue.name}' already exists (duplicate key).` });
    }
    res.status(500).json({ message: 'Server Error while creating department.' });
  }
};

// @desc    Admin gets a list of all departments
// @route   GET /api/admin/departments
exports.getDepartmentsForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { name } = req.query;
    const query = {};
    if (name) {
      query.name = { $regex: new RegExp(name, 'i') };
    }
    const totalDepartments = await Department.countDocuments(query);
    const departments = await Department.find(query).sort({ name: 1 }).skip(skip).limit(limit);
    res.status(200).json({
      message: 'Departments retrieved successfully for admin.',
      count: departments.length, total: totalDepartments, currentPage: page, totalPages: Math.ceil(totalDepartments / limit), departments,
    });
  } catch (error) {
    console.error('Error fetching departments for admin:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin gets a single department by ID
// @route   GET /api/admin/departments/:departmentId
exports.getDepartmentByIdForAdmin = async (req, res) => {
  try {
    const { departmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid Department ID format.' });
    }
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    res.status(200).json({ message: 'Department retrieved successfully for admin.', department });
  } catch (error) {
    console.error('Error fetching department by ID for admin:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin updates a department
// @route   PUT /api/admin/departments/:departmentId
exports.updateDepartmentByAdmin = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name, description, imageUrl, servicesOffered } = req.body;
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid Department ID format.' });
    }
    let department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    if (name && name !== department.name) {
      const existingDepartmentWithName = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: departmentId } });
      if (existingDepartmentWithName) {
        return res.status(400).json({ message: `Another department with name '${name}' already exists.` });
      }
      department.name = name;
    }
    if (description !== undefined) department.description = description;
    if (imageUrl !== undefined) department.imageUrl = imageUrl;
    if (servicesOffered !== undefined) department.servicesOffered = servicesOffered;
    const updatedDepartment = await department.save();
    res.status(200).json({ message: 'Department updated successfully.', department: updatedDepartment });
  } catch (error) {
    console.error('Error updating department by admin:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(val => val.message).join(', ') });
    }
    if (error.code === 11000) { return res.status(400).json({ message: `Department name '${req.body.name || department.name}' already exists.`}); }
    res.status(500).json({ message: 'Server Error while updating department.' });
  }
};

// @desc    Admin deletes a department
// @route   DELETE /api/admin/departments/:departmentId
exports.deleteDepartmentByAdmin = async (req, res) => {
  try {
    const { departmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid Department ID format.' });
    }
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    // TODO: Check if doctors are assigned to this department before deletion if that link exists
    await Department.findByIdAndDelete(departmentId);
    res.status(200).json({ message: 'Department deleted successfully.', departmentId });
  } catch (error) {
    console.error('Error deleting department by admin:', error.message);
    res.status(500).json({ message: 'Server Error while deleting department.' });
  }
};


// --- Hospital Information Management by Admin ---
// @desc    Admin updates (or creates if not exists) the hospital information
// @route   PUT /api/admin/hospital-info
exports.updateHospitalInfoByAdmin = async (req, res) => {
  try {
    const hospitalInfoData = req.body;
    const updatedHospitalInfo = await HospitalInfo.findOneAndUpdate({}, { $set: hospitalInfoData }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    res.status(200).json({ message: 'Hospital information updated successfully.', hospitalInfo: updatedHospitalInfo });
  } catch (error) {
    console.error('Error updating hospital information by admin:', error.message);
    if (error.name === 'ValidationError') { return res.status(400).json({ message: Object.values(error.errors).map(val => val.message).join(', ') }); }
    res.status(500).json({ message: 'Server Error while updating hospital information.' });
  }
};


// --- Callback Request Management by Admin ---
// @desc    Admin gets a list of all callback requests
// @route   GET /api/admin/callbacks
exports.getCallbackRequestsByAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { status, name, phoneNumber } = req.query;
    const query = {};
    if (status) query.status = status;
    if (name) query.name = { $regex: new RegExp(name, 'i') };
    if (phoneNumber) query.phoneNumber = { $regex: new RegExp(phoneNumber.replace(/\D/g, ''), 'i') };
    let sortOption = { status: 1, createdAt: -1 };
    if (req.query.sort === 'newest') sortOption = { createdAt: -1 };
    if (req.query.sort === 'oldest') sortOption = { createdAt: 1 };
    const totalRequests = await CallbackRequest.countDocuments(query);
    const callbackRequests = await CallbackRequest.find(query).sort(sortOption).skip(skip).limit(limit);
    res.status(200).json({
      message: 'Callback requests retrieved successfully.', count: callbackRequests.length, total: totalRequests, currentPage: page, totalPages: Math.ceil(totalRequests / limit), callbackRequests,
    });
  } catch (error) {
    console.error('Error fetching callback requests for admin:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin updates the status of a callback request
// @route   PUT /api/admin/callbacks/:callbackId/status
exports.updateCallbackRequestStatusByAdmin = async (req, res) => {
  try {
    const { callbackId } = req.params;
    const { status, staffNotes } = req.body;
    if (!mongoose.Types.ObjectId.isValid(callbackId)) return res.status(400).json({ message: 'Invalid Callback Request ID format.' });
    if (!status) return res.status(400).json({ message: 'New status is required.' });
    const allowedStatuses = CallbackRequest.schema.path('status').enumValues;
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: `Invalid status value. Allowed are: ${allowedStatuses.join(', ')}` });
    let callbackRequest = await CallbackRequest.findById(callbackId);
    if (!callbackRequest) return res.status(404).json({ message: 'Callback request not found.' });
    callbackRequest.status = status;
    if (staffNotes !== undefined) callbackRequest.staffNotes = staffNotes;
    const updatedCallbackRequest = await callbackRequest.save();
    res.status(200).json({ message: 'Callback request status updated successfully.', callbackRequest: updatedCallbackRequest });
  } catch (error) {
    console.error('Error updating callback request status by admin:', error.message);
    if (error.name === 'ValidationError') return res.status(400).json({ message: Object.values(error.errors).map(val => val.message).join(', ') });
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- Contact Inquiry Management by Admin ---
// @desc    Admin gets a list of all contact inquiries
// @route   GET /api/admin/contact-inquiries
exports.getContactInquiriesByAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { status, email, subject } = req.query;
    const query = {};
    if (status) query.status = status;
    if (email) query.email = { $regex: new RegExp(email, 'i') };
    if (subject) query.subject = { $regex: new RegExp(subject, 'i') };
    let sortOption = { status: 1, createdAt: -1 };
    if (req.query.sort === 'newest') sortOption = { createdAt: -1 };
    if (req.query.sort === 'oldest') sortOption = { createdAt: 1 };
    const totalInquiries = await ContactInquiry.countDocuments(query);
    const contactInquiries = await ContactInquiry.find(query).sort(sortOption).skip(skip).limit(limit);
    res.status(200).json({
      message: 'Contact inquiries retrieved successfully.', count: contactInquiries.length, total: totalInquiries, currentPage: page, totalPages: Math.ceil(totalInquiries / limit), contactInquiries,
    });
  } catch (error) {
    console.error('Error fetching contact inquiries for admin:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin updates the status of a contact inquiry
// @route   PUT /api/admin/contact-inquiries/:inquiryId/status
exports.updateContactInquiryStatusByAdmin = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status, staffNotes } = req.body;
    if (!mongoose.Types.ObjectId.isValid(inquiryId)) return res.status(400).json({ message: 'Invalid Contact Inquiry ID format.' });
    if (!status) return res.status(400).json({ message: 'New status is required.' });
    const allowedStatuses = ContactInquiry.schema.path('status').enumValues;
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: `Invalid status value. Allowed are: ${allowedStatuses.join(', ')}` });
    let contactInquiry = await ContactInquiry.findById(inquiryId);
    if (!contactInquiry) return res.status(404).json({ message: 'Contact inquiry not found.' });
    contactInquiry.status = status;
    if (staffNotes !== undefined) contactInquiry.staffNotes = staffNotes;
    const updatedContactInquiry = await contactInquiry.save();
    res.status(200).json({ message: 'Contact inquiry status updated successfully.', contactInquiry: updatedContactInquiry });
  } catch (error) {
    console.error('Error updating contact inquiry status by admin:', error.message);
    if (error.name === 'ValidationError') return res.status(400).json({ message: Object.values(error.errors).map(val => val.message).join(', ') });
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- Admin Analytics ---
// @desc    Admin gets a summary of patient statistics
// @route   GET /api/admin/analytics/patient-summary
exports.getPatientSummaryForAdmin = async (req, res) => {
  try {
    const totalRegisteredPatients = await Patient.countDocuments();
    const patientsWithAppointments = await Appointment.distinct('patient');
    const numberOfUniquePatientsWithAppointments = patientsWithAppointments.length;
    res.status(200).json({
      message: 'Patient summary retrieved successfully.', summary: { totalRegisteredPatients, numberOfUniquePatientsWithAppointments }
    });
  } catch (error) {
    console.error('Error fetching patient summary for admin:', error.message);
    res.status(500).json({ message: 'Server Error while fetching patient summary.' });
  }
};

// @desc    Admin gets a summary of appointment counts for each doctor
// @route   GET /api/admin/analytics/doctor-appointment-summary
exports.getDoctorAppointmentSummaryForAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('_id name specialization email');
    const doctorSummaries = [];
    for (const doctor of doctors) {
      const totalAppointments = await Appointment.countDocuments({ doctor: doctor._id });
      const scheduledAppointments = await Appointment.countDocuments({ doctor: doctor._id, status: 'Scheduled' });
      const confirmedAppointments = await Appointment.countDocuments({ doctor: doctor._id, status: 'Confirmed' });
      const completedAppointments = await Appointment.countDocuments({ doctor: doctor._id, status: 'Completed' });
      const cancelledAppointments = await Appointment.countDocuments({ doctor: doctor._id, status: { $in: ['CancelledByPatient', 'CancelledByDoctor', 'CancelledByAdmin'] } });
      doctorSummaries.push({
        doctorId: doctor._id, name: doctor.name, specialization: doctor.specialization, email: doctor.email,
        counts: { total: totalAppointments, scheduled: scheduledAppointments, confirmed: confirmedAppointments, completed: completedAppointments, cancelled: cancelledAppointments }
      });
    }
    res.status(200).json({ message: "Doctor appointment summary retrieved successfully.", summary: doctorSummaries, totalDoctors: doctors.length });
  } catch (error) {
    console.error('Error fetching doctor appointment summary for admin:', error.message);
    res.status(500).json({ message: 'Server Error while fetching doctor appointment summary.' });
  }
};


// @desc    Admin creates a new doctor (handles department assignment)
// @route   POST /api/admin/doctors
// @access  Private (Admin)
exports.createDoctorByAdmin = async (req, res) => {
  try {
    // Destructure all expected fields from req.body
    const { 
        name, 
        email, 
        password, 
        specialization, 
        phone, 
        availabilitySchedule, // This is the complex nested array for weekly schedule
        departmentId, 
        role,
        // New public profile fields we added
        photoUrl,
        publicBio,
        isFeatured 
    } = req.body;

    // Core validations
    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ message: 'Name, email, password, and specialization are required.' });
    }

    // Check for existing doctor by email
    let existingDoctor = await Doctor.findOne({ email }); // Mongoose email schema has lowercase: true, so this should be case-insensitive if input is also lowercased or if no special chars
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    // Validate departmentId if provided
    if (departmentId) {
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({ message: 'Invalid Department ID format.' });
      }
      const departmentExists = await Department.findById(departmentId);
      if (!departmentExists) {
        return res.status(404).json({ message: 'Department not found. Cannot assign doctor.' });
      }
    }

    // Construct the new doctor object
    const newDoctorData = {
      name,
      email,
      password, // Password will be hashed by the pre-save hook in the Doctor model
      specialization,
      phone: phone || undefined, // Set to undefined if not provided to avoid empty string issues
      availabilitySchedule: availabilitySchedule || undefined, // Use schema default if not provided
      department: departmentId || undefined, // Assign departmentId if provided
      role: role || 'doctor', // Default to 'doctor', admin can override if your enum allows
      photoUrl: photoUrl || undefined,
      publicBio: publicBio || undefined,
      isFeatured: isFeatured === undefined ? false : Boolean(isFeatured) // Explicitly handle boolean, default to false
    };

    const newDoctor = new Doctor(newDoctorData);
    await newDoctor.save(); // This will trigger pre-save hooks (password hashing) and schema validations

    // Populate department details for the response
    // Select fields to exclude password from the final populated response
    const populatedDoctor = await Doctor.findById(newDoctor._id)
      .select('-password -isAdminControlled') // Exclude isAdminControlled as well for typical responses
      .populate('department', 'name description'); // Populate with department name and description

    res.status(201).json({
      message: 'Doctor created successfully by admin.',
      doctor: populatedDoctor,
    });

  } catch (err) {
    console.error('Error creating doctor by admin:', err.message, err.stack); // Log stack for more detail
    if (err.name === 'ValidationError') {
      // Extract and send Mongoose validation error messages
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    // Check for MongoDB duplicate key error (for email, though findOne should catch it first)
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ message: `Doctor with email '${req.body.email}' already exists.`});
    }
    // Generic server error
    res.status(500).json({ message: 'Server Error while creating doctor.' });
  }
};

// @desc    Admin gets a list of all doctors
// @route   GET /api/admin/doctors
// @access  Private (Admin)
exports.getDoctorsForAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const { name, specialization, departmentId } = req.query;
        const query = {};

        if (name) query.name = { $regex: new RegExp(name, 'i') };
        if (specialization) query.specialization = { $regex: new RegExp(specialization, 'i') };
        if (departmentId) {
            if (!mongoose.Types.ObjectId.isValid(departmentId)) {
                return res.status(400).json({ message: 'Invalid Department ID format for filter.' });
            }
            query.department = departmentId;
        }
        
        const totalDoctors = await Doctor.countDocuments(query);
        const doctors = await Doctor.find(query)
            .populate('department', 'name') // Populate department name
            .select('-password') // Exclude password
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: 'Doctors retrieved successfully for admin.',
            count: doctors.length,
            total: totalDoctors,
            currentPage: page,
            totalPages: Math.ceil(totalDoctors / limit),
            doctors,
        });
    } catch (error) {
        console.error('Error fetching doctors for admin:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin gets a single doctor by ID
// @route   GET /api/admin/doctors/:doctorId
// @access  Private (Admin)
exports.getDoctorByIdForAdmin = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: 'Invalid Doctor ID format.' });
        }
        const doctor = await Doctor.findById(doctorId)
            .populate('department', 'name description')
            .select('-password');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }
        res.status(200).json({ doctor });
    } catch (error) {
        console.error('Error fetching doctor by ID for admin:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin updates a doctor's details
// @route   PUT /api/admin/doctors/:doctorId
// @access  Private (Admin)
exports.updateDoctorByAdmin = async (req, res) => {
  try {
    const { doctorId } = req.params;
    // You are only destructuring a few fields here from req.body
    // const { name, email, specialization, phone, availabilitySchedule, departmentId, role } = req.body;
    // You need to destructure ALL fields that can be updated, or access them directly from req.body

    // ... (validation for doctorId) ...
    let doctor = await Doctor.findById(doctorId);
    // ... (check if doctor exists) ...

    // Check for email uniqueness if email is being changed
    if (req.body.email && req.body.email !== doctor.email) {
        // ... your email uniqueness check logic ...
        doctor.email = req.body.email;
    }

    // --- THIS IS THE MOST LIKELY AREA FOR THE PROBLEM ---
    // You are only explicitly updating a few fields.
    // You need to update ALL fields that the admin is allowed to change.

    if (req.body.name !== undefined) doctor.name = req.body.name;
    if (req.body.specialization !== undefined) doctor.specialization = req.body.specialization;
    if (req.body.phone !== undefined) doctor.phone = req.body.phone;
    
    // Department Update
    if (req.body.department !== undefined) { // departmentId is sent as 'department' in payload
        if (req.body.department === null || req.body.department === '') {
            doctor.department = undefined; // Unassign
        } else if (mongoose.Types.ObjectId.isValid(req.body.department)) {
            const departmentExists = await Department.findById(req.body.department);
            if (!departmentExists) {
                return res.status(404).json({ message: 'Department to assign not found.' });
            }
            doctor.department = req.body.department;
        } else {
            return res.status(400).json({ message: 'Invalid Department ID format for assignment.' });
        }
    }

    if (req.body.role && ['doctor', 'admin'].includes(req.body.role)) { // Ensure role is valid
        doctor.role = req.body.role;
    }

    // Update new public profile fields
    if (req.body.photoUrl !== undefined) doctor.photoUrl = req.body.photoUrl;
    if (req.body.publicBio !== undefined) doctor.publicBio = req.body.publicBio;
    if (req.body.hasOwnProperty('isFeatured')) { // Check if 'isFeatured' was actually sent
        doctor.isFeatured = Boolean(req.body.isFeatured);
    }

    // Update availability schedule and overrides
    if (req.body.availabilitySchedule !== undefined) {
        // Add validation for the structure of availabilitySchedule if needed
        doctor.availabilitySchedule = req.body.availabilitySchedule;
    }
    if (req.body.availabilityOverrides !== undefined) {
        // Add validation for the structure of availabilityOverrides if needed
        // Ensure dates are correctly handled/parsed if they arrive as strings and need to be Dates in Mongoose
        doctor.availabilityOverrides = req.body.availabilityOverrides.map(override => ({
            ...override,
            date: new Date(override.date) // Convert date string from payload back to Date object for Mongoose
        }));
    }

    // Password should NOT be updated here. It has a separate flow.

    const updatedDoctor = await doctor.save(); // Save the changes
    const populatedDoctor = await Doctor.findById(updatedDoctor._id) // Re-fetch and populate
        .select('-password -isAdminControlled')
        .populate('department', 'name description'); // Changed from 'name' to 'name description'

    res.status(200).json({
      message: 'Doctor details updated successfully by admin.',
      doctor: populatedDoctor,
    });

  } catch (err) {
    // ... (your error handling) ...
  }
};

// @desc    Admin deletes a doctor
// @route   DELETE /api/admin/doctors/:doctorId
// @access  Private (Admin)
exports.deleteDoctorByAdmin = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: 'Invalid Doctor ID format.' });
        }
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // TODO: Add more robust checks before deleting a doctor:
        // 1. Are there upcoming appointments for this doctor?
        //    - If so, prevent deletion or reassign appointments.
        //    - const upcomingAppointments = await Appointment.countDocuments({ doctor: doctorId, appointmentDate: { $gte: new Date() }, status: {$in: ['Scheduled', 'Confirmed']} });
        //    - if (upcomingAppointments > 0) return res.status(400).json({ message: 'Cannot delete doctor. They have upcoming appointments. Please reassign or cancel them first.' });

        await Doctor.findByIdAndDelete(doctorId);
        // Also consider what to do with their appointments. Delete them? Unassign them?
        // For now, appointments will remain but will have an orphaned doctor ID if not handled.

        res.status(200).json({ message: 'Doctor deleted successfully.', doctorId });

    } catch (error) {
        console.error('Error deleting doctor by admin:', error.message);
        res.status(500).json({ message: 'Server Error while deleting doctor.' });
    }
};

/**
 * @desc    Admin gets a list of all patients (with pagination and filters)
 * @route   GET /api/admin/patients
 * @access  Private (Admin)
 */
exports.getAllPatientsForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { name, email, status } = req.query; // Add other filters as needed
    const query = {};

    if (name) {
      query.name = { $regex: new RegExp(name, 'i') };
    }
    if (email) {
      query.email = { $regex: new RegExp(email, 'i') };
    }
    // Example: if you add an 'isActive' status to your Patient model for account status
    // if (status) {
    //   if (status === 'active') query.isActive = true;
    //   if (status === 'inactive') query.isActive = false;
    // }

    const selectFields = 'name email dateOfBirth gender contact.phone createdAt isActive'; // Customize as needed

    const totalPatients = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .select(selectFields) // Select fields appropriate for admin list view
      .sort({ createdAt: -1 }) // Show newest registered first, or by name: { name: 1 }
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: 'Patients retrieved successfully for admin.',
      count: patients.length,
      total: totalPatients,
      currentPage: page,
      totalPages: Math.ceil(totalPatients / limit),
      patients,
    });

  } catch (error) {
    console.error('Error fetching patients for admin:', error.message);
    res.status(500).json({ message: 'Server Error while fetching patients.' });
  }
};
