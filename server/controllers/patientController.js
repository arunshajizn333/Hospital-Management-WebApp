// controllers/patientController.js
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor'); // May be needed if future functions require doctor details related to patients
const mongoose = require('mongoose'); // Used for ObjectId validation

// --- Patient's Own Actions ---

/**
 * @desc    Patient gets their own profile
 * @route   GET /api/patients/me/profile
 * @access  Private (Patient)
 */
exports.getMyPatientProfile = async (req, res) => {
  try {
    // req.user.id is populated by the 'protect' middleware from the authenticated patient's token
    const patientId = req.user.id;

    const patient = await Patient.findById(patientId)
      .select('-password') // Exclude password from the main patient document response
      .populate({
        path: 'medicalHistory.doctorAttended', // Path to the nested field in the array
        select: 'name specialization' // Specify which fields of the Doctor to populate
        // model: 'Doctor' // Mongoose can usually infer this from the schema ref, but can be explicit
      });

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found.' });
    }

    // The patient object now has medicalHistory where each entry's doctorAttended
    // field (if it had an ID) is replaced with the doctor's name and specialization.
    res.status(200).json(patient);

  } catch (error) {
    console.error('Error fetching patient profile with medical history:', error.message);
    // Consider more specific error handling if needed (e.g., for population errors)
    res.status(500).json({ message: 'Server Error while fetching patient profile.' });
  }
};

/**
 * @desc    Patient updates their own profile (non-medical info)
 * @route   PUT /api/patients/me/profile
 * @access  Private (Patient)
 */
exports.updateMyPatientProfile = async (req, res) => {
  try {
    // Patients can typically update their own contact and general demographic information
    const { name, dateOfBirth, gender, contact } = req.body;
    
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (dateOfBirth !== undefined) fieldsToUpdate.dateOfBirth = dateOfBirth;
    if (gender !== undefined) fieldsToUpdate.gender = gender;
    
    // Assuming 'contact' is an object like { phone, address }
    // This allows partial updates to contact info
    if (typeof contact === 'object' && contact !== null) {
      fieldsToUpdate.contact = {}; // Initialize if not present
      if (contact.phone !== undefined) fieldsToUpdate.contact.phone = contact.phone;
      if (contact.address !== undefined) fieldsToUpdate.contact.address = contact.address;
    }

    // Note: Email, password, and medical history are not updated here.
    // Email changes often require verification; password changes have a dedicated route.
    // Medical history is managed by doctors.

    const patient = await Patient.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true } // Return updated doc & run schema validators
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found.' });
    }
    res.status(200).json({ message: 'Profile updated successfully.', patient });
  } catch (error) {
    console.error('Error updating patient profile:', error.message);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error while updating patient profile.' });
  }
};

/**
 * @desc    Patient views their own medical records
 * @route   GET /api/patients/me/medical-records
 * @access  Private (Patient)
 */
exports.getMyMedicalRecords = async (req, res) => {
  try {
    // Select only relevant fields for patient viewing
    const patient = await Patient.findById(req.user.id).select('medicalHistory name'); 
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    res.status(200).json({ patientName: patient.name, medicalHistory: patient.medicalHistory });
  } catch (error) {
    console.error('Error fetching patient medical records:', error.message);
    res.status(500).json({ message: 'Server Error while fetching medical records.' });
  }
};


// --- Doctor's Actions on Patients ---

/**
 * @desc    Doctor or Admin creates a new patient profile (e.g., for a walk-in patient)
 * @route   POST /api/patients  (Note: Ensure this route is protected for 'doctor', 'admin' roles in patientRoutes.js)
 * @access  Private (Doctor, Admin)
 */
exports.createPatientByAuthorizedUser = async (req, res) => {
    const { name, email, password, dateOfBirth, gender, contact } = req.body;
    try {
        // Password is required here as staff are creating an account for the patient
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required to create a patient profile.' });
        }
        let patient = await Patient.findOne({ email });
        if (patient) {
            return res.status(400).json({ message: 'Patient with this email already exists.' });
        }
        patient = new Patient({
            name, email, password, dateOfBirth, gender, contact, role: 'patient' // Role is fixed
        });
        await patient.save();
        
        // Ensure password is not sent in the response
        const patientResponse = { ...patient.toObject() };
        delete patientResponse.password; 
        
        res.status(201).json({ message: 'Patient profile created successfully.', patient: patientResponse });
    } catch (error) {
        console.error('Error creating patient by authorized user:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
        }
        if (error.code === 11000) { // Duplicate email key error
            return res.status(400).json({ message: `Patient with email '${email}' already exists.` });
        }
        res.status(500).json({ message: 'Server Error while creating patient.' });
    }
};


/**
 * @desc    Doctor views a specific patient's profile (including medical history)
 * @route   GET /api/patients/doctor/:patientId/profile (Note: Ensure this route is protected for 'doctor' role in patientRoutes.js)
 * @access  Private (Doctor)
 */
exports.getPatientProfileForDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid Patient ID format.' });
    }

    const patient = await Patient.findById(patientId).select('-password'); // Exclude password
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    // IMPORTANT TODO for production: Implement robust authorization logic here.
    // Ensure the requesting doctor has a valid reason (e.g., an active appointment, assigned physician)
    // to access this specific patient's records before returning data.
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient profile for doctor:', error.message);
    // CastError for ObjectId is already handled by the isValid check,
    // but good to keep a general 500 for other unexpected errors.
    res.status(500).json({ message: 'Server Error while fetching patient profile.' });
  }
};

/**
 * @desc    Doctor updates a patient's profile (primarily medical information or notes)
 * @route   PUT /api/patients/doctor/:patientId/profile (Note: Ensure this route is protected for 'doctor' role in patientRoutes.js)
 * @access  Private (Doctor)
 */
exports.updatePatientProfileForDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;
    // Doctors should only update specific fields related to medical care or observations.
    // Sensitive fields like email, password, or core demographic name should ideally not be changed here by a doctor.
    const { simpleMedicalHistoryNotes, allergies /* other doctor-updatable fields */ } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid Patient ID format.' });
    }

    const updateData = {};
    // Only add fields to updateData if they are provided in the request body
    if (simpleMedicalHistoryNotes !== undefined) updateData.simpleMedicalHistoryNotes = simpleMedicalHistoryNotes;
    if (allergies !== undefined) updateData.allergies = allergies;
    // Example: if (observations !== undefined) updateData.observations = observations;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    // Note: Medical history is more robustly managed by adding new records via dedicated endpoint.
    // This route could be for more general notes or specific profile fields doctors manage.

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    res.status(200).json({ message: "Patient's medical profile updated successfully by doctor.", patient });
  } catch (error) {
    console.error('Error updating patient profile by doctor:', error.message);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error while updating patient profile.' });
  }
};

/**
 * @desc    Doctor adds a new medical record entry for a patient
 * @route   POST /api/patients/doctor/:patientId/medical-records (Note: Ensure this route is protected for 'doctor' role in patientRoutes.js)
 * @access  Private (Doctor)
 */
exports.addMedicalRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { description, diagnosis, treatment } = req.body;
    const doctorId = req.user.id; // ID of the logged-in doctor from 'protect' middleware

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid Patient ID format.' });
    }
    if (!description) { // Assuming description is the minimum required for a record
        return res.status(400).json({ message: 'Description for the medical record is required.' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const newRecord = {
      description,
      diagnosis: diagnosis || "", // Default to empty string if not provided
      treatment: treatment || "", // Default to empty string
      doctorAttended: doctorId,
      date: new Date() // Explicitly set record date
    };

    patient.medicalHistory.unshift(newRecord); // Add new record to the beginning of the array
    await patient.save(); // This will also validate the sub-document
    
    // Return the newly added record for confirmation
    res.status(201).json({ message: 'Medical record added successfully.', medicalRecord: patient.medicalHistory[0] });
  } catch (error) {
    console.error('Error adding medical record:', error.message);
    if (error.name === 'ValidationError') { // Handles validation errors from both Patient and sub-schema
        return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Server Error while adding medical record.' });
  }
};

/**
 * @desc    Doctor searches for patients by name or email
 * @route   GET /api/patients/doctor-search (Note: Ensure this route is protected for 'doctor' role in patientRoutes.js)
 * @access  Private (Doctor)
 */
exports.searchPatientsForDoctor = async (req, res) => {
    try {
        const { query: searchQuery } = req.query; // Renamed to avoid conflict with 'query' variable for DB
        if (!searchQuery) {
            return res.status(400).json({ message: 'Search query is required.' });
        }
        const searchRegex = new RegExp(searchQuery, 'i'); // Case-insensitive search
        
        // Fields to return in search results for doctors
        const searchResultFields = 'name email dateOfBirth gender contact.phone'; 
        
        const patients = await Patient.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex }
                // TODO: Consider adding search by a unique patient identifier if available
            ]
        }).select(searchResultFields);

        res.status(200).json({ count: patients.length, patients });
    } catch (error) {
        console.error('Error searching patients:', error.message);
        res.status(500).json({ message: 'Server Error while searching patients.' });
    }
};


// --- Admin's Actions on Patients ---

/**
 * @desc    Admin gets a list of all patients
 * @route   GET /api/patients/admin/all (Note: Ensure this route is protected for 'admin' role in patientRoutes.js or adminRoutes.js)
 * @access  Private (Admin)
 */
exports.listAllPatientsForAdmin = async (req, res) => {
  try {
    // TODO: Implement pagination for admins as this list can grow large
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const totalPatients = await Patient.countDocuments();
    const patients = await Patient.find()
      .select('-password -medicalHistory') // Exclude bulky/sensitive fields for admin list view
      .sort({ createdAt: -1 }) // Show newest registered first
      .skip(skip)
      .limit(limit);
      
    res.status(200).json({ 
        message: "Patients retrieved successfully for admin.",
        count: patients.length,
        total: totalPatients,
        currentPage: page,
        totalPages: Math.ceil(totalPatients / limit),
        patients 
    });
  } catch (error) {
    console.error('Error listing all patients for admin:', error.message);
    res.status(500).json({ message: 'Server Error while listing patients.' });
  }
};

/**
 * @desc    Admin views a specific patient's full profile
 * @route   GET /api/patients/admin/:patientId/profile (Note: Ensure this route is protected for 'admin' role in patientRoutes.js or adminRoutes.js)
 * @access  Private (Admin)
 */
exports.getPatientByIdForAdmin = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid Patient ID format.' });
    }
    const patient = await Patient.findById(patientId).select('-password'); // Exclude password
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient for admin:', error.message);
    res.status(500).json({ message: 'Server Error while fetching patient profile.' });
  }
};

// Placeholder for Admin updating patient status (e.g., activate/deactivate account)
// exports.updatePatientStatusByAdmin = async (req, res) => { /* ... */ };