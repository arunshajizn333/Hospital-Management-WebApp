// models/Doctor.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Sub-schema for break times
const breakTimeSchema = new mongoose.Schema({
  breakStart: { type: String, required: true, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid break start time format (HH:MM)'] },
  breakEnd: { type: String, required: true, match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid break end time format (HH:MM)'] }
}, {_id: false});

// Sub-schema for weekly daily availability
const dailyAvailabilitySchema = new mongoose.Schema({
  dayOfWeek: { type: String, required: true, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']},
  isAvailable: { type: Boolean, default: false },
  startTime: { type: String, validate: { validator: function(v) { return !this.isAvailable || (this.isAvailable && v && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)); }, message: 'Start time required if available (HH:MM)'}},
  endTime: { type: String, validate: { validator: function(v) { return !this.isAvailable || (this.isAvailable && v && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v) && (!this.startTime || v > this.startTime)); }, message: 'End time required if available & after start (HH:MM)'}},
  slotDurationMinutes: { type: Number, validate: { validator: function(v) { return !this.isAvailable || (this.isAvailable && v && v > 0); }, message: 'Slot duration required if available'}},
  breakTimes: [breakTimeSchema]
}, {_id: false});

// --- NEW: Sub-schema for Date-Specific Availability Overrides ---
const dateOverrideSchema = new mongoose.Schema({
    date: { // Specific date for the override
        type: Date,
        required: true
    },
    isAvailable: { // Is the doctor available or explicitly unavailable on this date?
        type: Boolean,
        required: true
    },
    // The following fields are only relevant if isAvailable is true for this specific date
    startTime: { 
        type: String, 
        validate: { validator: function(v) { return !this.isAvailable || (this.isAvailable && v && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)); }, message: 'Start time required if available on this date (HH:MM)'}
    },
    endTime: { 
        type: String, 
        validate: { validator: function(v) { return !this.isAvailable || (this.isAvailable && v && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v) && (!this.startTime || v > this.startTime)); }, message: 'End time required if available & after start on this date (HH:MM)'}
    },
    slotDurationMinutes: { 
        type: Number,
        validate: { validator: function(v) { return !this.isAvailable || (this.isAvailable && v && v > 0); }, message: 'Slot duration required if available on this date'}
    },
    breakTimes: [breakTimeSchema]
}, {_id: false }); // Consider if you want _id for overrides, usually not necessary if managed as part of doctor doc


const doctorSchema = new mongoose.Schema({
  // ... (name, email, password, specialization, department, phone, role fields as before) ...
  name: { type: String, required: [true, 'Doctor name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address', ]},
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters long'], select: false },
  specialization: { type: String, required: [true, 'Specialization is required'], trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['doctor', 'admin'], default: 'doctor' },
  
  availabilitySchedule: { // Weekly repeating schedule
    type: [dailyAvailabilitySchema],
    default: () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.map(day => ({ dayOfWeek: day, isAvailable: false }));
    }
  },

  // --- NEW: Date-Specific Availability Overrides ---
  availabilityOverrides: {
    type: [dateOverrideSchema],
    default: [] // Default to an empty array
  },
  // --- END NEW FIELD ---

  photoUrl: { type: String, trim: true },
  publicBio: { type: String, trim: true, maxlength: [1000, 'Public bio cannot exceed 1000 characters.'] },
  isFeatured: { type: Boolean, default: false },
  isAdminControlled: { type: Boolean, default: true },
}, { timestamps: true });

// ... (pre-save password hashing and comparePassword method remain the same) ...
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) { return next(); }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
doctorSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;