// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: { // Or username, depending on your preference
    type: String,
    required: [true, 'Admin name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required for admin'],
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
    required: [true, 'Password is required for admin'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Hide password by default when querying
  },
  role: {
    type: String,
    default: 'admin', // Fixed role for this model
    enum: ['admin']   // Ensures role can only be 'admin'
  },
  // You can add other admin-specific fields here if needed later,
  // e.g., lastLogin, permissions (if you implement granular permissions)
}, { timestamps: true }); // Automatically manages createdAt and updatedAt

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in DB
adminSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;