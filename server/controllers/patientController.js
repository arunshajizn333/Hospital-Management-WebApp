// controllers/patientController.js
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor'); // May be needed for cross-referencing or validation

// --- Patient's Own Actions ---

// @desc    Patient gets their own profile
// @route   GET /api/patients/me/profile
exports.getMyPatientProfile = async (req, res) => {
  try {
    // req.user should be populated by the 'protect' middleware
    const patient = await Patient.findById(req.user.id).select('-password'); // Exclude password
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient profile:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Patient updates their own profile (non-medical info)
// @route   PUT /api/patients/me/profile
exports.updateMyPatientProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, gender, contact } = req.body; // Patients can update these
    
    // Fields patient can update themselves
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (dateOfBirth) fieldsToUpdate.dateOfBirth = dateOfBirth;
    if (gender) fieldsToUpdate.gender = gender;
    if (contact) { // Assuming contact is an object { phone, address }
        fieldsToUpdate.contact = {};
        if (contact.phone !== undefined) fieldsToUpdate.contact.phone = contact.phone;
        if (contact.address !== undefined) fieldsToUpdate.contact.address = contact.address;
    }


    // Email and medical history are typically not updated by patient directly here
    // Password change has a separate route /api/auth/change-password

    const patient = await Patient.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.status(200).json({ message: 'Profile updated successfully', patient });
  } catch (error) {
    console.error('Error updating patient profile:', error.message);
     if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Patient views their own medical records summary/list
// @route   GET /api/patients/me/medical-records
exports.getMyMedicalRecords = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('medicalHistory name');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ medicalHistory: patient.medicalHistory, patientName: patient.name });
  } catch (error) {
    console.error('Error fetching patient medical records:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- Doctor's Actions on Patients ---

// @desc    Doctor or Admin creates a new patient profile
// @route   POST /api/patients
exports.createPatientByAuthorizedUser = async (req, res) => {
    const { name, email, password, dateOfBirth, gender, contact } = req.body;
    try {
        if (!name || !email || !password) { // Password required for local account creation by staff
            return res.status(400).json({ message: 'Name, email, and password are required to create a patient profile.' });
        }
        let patient = await Patient.findOne({ email });
        if (patient) {
            return res.status(400).json({ message: 'Patient with this email already exists.' });
        }
        patient = new Patient({
            name, email, password, dateOfBirth, gender, contact, role: 'patient'
        });
        await patient.save();
        const patientResponse = { ...patient.toObject() };
        delete patientResponse.password; // Ensure password is not in response
        res.status(201).json({ message: 'Patient profile created successfully.', patient: patientResponse });
    } catch (error) {
        console.error('Error creating patient by authorized user:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Doctor views a specific patient's profile
// @route   GET /api/patients/doctor/:patientId/profile
exports.getPatientProfileForDoctor = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).select('-password'); // Exclude password
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    // In a real app, add logic here to ensure the requesting doctor is authorized for this patient
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient profile for doctor:', error.message);
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid Patient ID' });
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Doctor updates a patient's profile (medical info)
// @route   PUT /api/patients/doctor/:patientId/profile
exports.updatePatientProfileForDoctor = async (req, res) => {
  try {
    // Doctors can update medical history, allergies, notes, etc.
    // For simplicity, let's assume direct update of some fields.
    // A more robust way is to only allow adding to medicalHistory via dedicated endpoints.
    const { simpleMedicalHistoryNotes, allergies } = req.body; // Example fields doctor can update

    const updateData = {};
    if (simpleMedicalHistoryNotes) updateData.simpleMedicalHistoryNotes = simpleMedicalHistoryNotes;
    if (allergies) updateData.allergies = allergies;
    // Do NOT allow doctor to update email, password, name directly here.

    const patient = await Patient.findByIdAndUpdate(
      req.params.patientId,
      { $set: updateData }, // Or use $addToSet for arrays like medicalHistory if appropriate
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ message: "Patient's medical profile updated", patient });
  } catch (error) {
    console.error('Error updating patient profile by doctor:', error.message);
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid Patient ID' });
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Doctor adds a new medical record entry for a patient
// @route   POST /api/patients/doctor/:patientId/medical-records
exports.addMedicalRecord = async (req, res) => {
  try {
    const { description, diagnosis, treatment } = req.body;
    const patient = await Patient.findById(req.params.patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newRecord = {
      description,
      diagnosis,
      treatment,
      doctorAttended: req.user.id, // ID of the logged-in doctor from protect middleware
      date: new Date()
    };

    patient.medicalHistory.unshift(newRecord); // Add to the beginning of the array
    await patient.save();
    
    // Return only the newly added record or updated history
    res.status(201).json({ message: 'Medical record added successfully', medicalRecord: patient.medicalHistory[0] });
  } catch (error) {
    console.error('Error adding medical record:', error.message);
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid Patient ID' });
     if (error.name === 'ValidationError') { // Validation for sub-schema
        return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Doctor searches for patients
// @route   GET /api/patients/doctor-search
exports.searchPatientsForDoctor = async (req, res) => {
    try {
        const { query } = req.query; // e.g., ?query=John Doe or ?query=john@example.com
        if (!query) {
            return res.status(400).json({ message: 'Search query is required.' });
        }
        const searchRegex = new RegExp(query, 'i'); // Case-insensitive search
        const patients = await Patient.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex }
                // Add other fields to search if necessary, like a patient ID
            ]
        }).select('name email dateOfBirth gender'); // Select fields relevant for search results

        res.status(200).json({ patients });
    } catch (error) {
        console.error('Error searching patients:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


// --- Admin's Actions on Patients ---

// @desc    Admin gets a list of all patients
// @route   GET /api/patients/admin/all
exports.listAllPatientsForAdmin = async (req, res) => {
  try {
    // Add pagination later if needed
    const patients = await Patient.find().select('-password -medicalHistory'); // Exclude bulky/sensitive fields for list view
    res.status(200).json({ patients });
  } catch (error) {
    console.error('Error listing all patients for admin:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin views a specific patient's full profile
// @route   GET /api/patients/admin/:patientId/profile
exports.getPatientByIdForAdmin = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient for admin:', error.message);
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid Patient ID' });
    res.status(500).json({ message: 'Server Error' });
  }
};



// Placeholder for updatePatientStatusByAdmin - to be implemented if needed
// exports.updatePatientStatusByAdmin = async (req, res) => { ... };