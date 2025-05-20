// models/CallbackRequest.js
const mongoose = require('mongoose');

const callbackRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required for a callback request.'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters.']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required for a callback request.'],
    trim: true,
    match: [/^\+?[0-9\s\-()]{7,20}$/, 'Please provide a valid phone number.'] // Basic phone validation
  },
  preferredTime: { // e.g., "Morning", "Afternoon", "Evening", "Anytime", or specific time
    type: String,
    trim: true,
    maxlength: [50, 'Preferred time cannot exceed 50 characters.']
  },
  reason: { // Brief reason for the callback
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters.']
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Resolved', 'FailedAttempt'],
    default: 'Pending'
  },
  // Optional: notes by admin/staff who handled the callback
  staffNotes: {
    type: String,
    trim: true
  },
  // Optional: who handled it
  // handledBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Admin' // or 'User' if staff are also users
  // }
}, { timestamps: true }); // `createdAt` will be the submission time, `updatedAt` for status changes

callbackRequestSchema.index({ status: 1, createdAt: -1 }); // For admins to query pending requests

const CallbackRequest = mongoose.model('CallbackRequest', callbackRequestSchema);
module.exports = CallbackRequest;