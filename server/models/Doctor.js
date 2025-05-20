// models/Doctor.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- NEW: Sub-schema for break times ---
const breakTimeSchema = new mongoose.Schema({
  breakStart: { // e.g., "12:00"
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid break start time format (HH:MM)']
  },
  breakEnd: { // e.g., "13:00"
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid break end time format (HH:MM)']
  }
}, {_id: false}); // _id: false for subdocuments if not needed as standalone entities

// --- NEW: Sub-schema for daily availability ---
const dailyAvailabilitySchema = new mongoose.Schema({
  dayOfWeek: { // e.g., "Monday", "Tuesday", etc.
    type: String,
    required: true,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  startTime: { // e.g., "09:00"
    type: String,
    // Required only if isAvailable is true
    validate: {
        validator: function(v) {
            // this.isAvailable refers to the parent document (dailyAvailabilitySchema instance)
            return !this.isAvailable || (this.isAvailable && v && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v));
        },
        message: props => `Start time is required and must be HH:MM format if available on ${props.path.replace('.startTime', '')}`
    }
  },
  endTime: { // e.g., "17:00"
    type: String,
    validate: {
        validator: function(v) {
            return !this.isAvailable || (this.isAvailable && v && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v) && (!this.startTime || v > this.startTime));
        },
        message: props => `End time is required, must be HH:MM format, and after start time if available on ${props.path.replace('.endTime', '')}`
    }
  },
  slotDurationMinutes: { // e.g., 30 for 30-minute slots
    type: Number,
    validate: {
        validator: function(v) {
            return !this.isAvailable || (this.isAvailable && v && v > 0);
        },
        message: props => `Slot duration is required and must be positive if available on ${props.path.replace('.slotDurationMinutes', '')}`
    }
  },
  breakTimes: [breakTimeSchema] // Array of break periods
}, {_id: false});


const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
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
    select: false,
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  // availabilityNotes: { // You can choose to keep this for general notes or remove it
  //   type: String,
  //   trim: true,
  //   default: 'Availability not specified. Please contact for details.',
  // },
  role: { // If you adopted the separate Admin model, this might just be 'doctor'
    type: String,
    enum: ['doctor', 'admin'], // Or just ['doctor'] if Admin is fully separate
    default: 'doctor'
  },
  // --- NEW: Structured Availability Schedule ---
  availabilitySchedule: {
    type: [dailyAvailabilitySchema],
    default: () => { // Default to a full week, all marked as unavailable initially
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.map(day => ({ dayOfWeek: day, isAvailable: false }));
    }
    // You could add a validator to ensure there are 7 unique days if needed
  },
  isAdminControlled: { // We had this before, ensure it's still relevant
    type: Boolean,
    default: true,
  },
  // createdAt and updatedAt are handled by timestamps: true
}, { timestamps: true }); // { timestamps: true } automatically manages createdAt and updatedAt

// Pre-save middleware to hash password (KEEP THIS)
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password (KEEP THIS)
doctorSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;