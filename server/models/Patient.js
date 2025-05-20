// models/Patient.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const medicalRecordEntrySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    description: { type: String, required: true }, // e.g., "Annual Checkup", "Flu Symptoms"
    diagnosis: { type: String },
    treatment: { type: String },
    doctorAttended: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' } // Optional: Link to doctor
});

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Hide password by default
  },
  dateOfBirth: {
    type: Date,
    // required: [true, 'Date of birth is required'], // Make optional if preferred
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
  },
  contact: {
    phone: { type: String, trim: true /*required: [true, 'Phone number is required']*/ },
    address: { type: String, trim: true },
  },
  medicalHistory: [medicalRecordEntrySchema], // Using the sub-schema defined above
  // Simple medical history (alternative or additional)
  // simpleMedicalHistoryNotes: [{ type: String }],
  // allergies: [{ type: String }],
  role: {
    type: String,
    default: 'patient', // Fixed role for this model
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true }); // { timestamps: true } automatically manages createdAt and updatedAt

// Pre-save middleware to hash password
patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
patientSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;