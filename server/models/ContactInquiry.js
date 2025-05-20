// models/ContactInquiry.js
const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required for a contact inquiry.'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters.']
  },
  email: {
    type: String,
    required: [true, 'Email is required for a contact inquiry.'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address.'
    ]
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters.'],
    default: 'General Inquiry'
  },
  message: {
    type: String,
    required: [true, 'Message is required for a contact inquiry.'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters.']
  },
  status: {
    type: String,
    enum: ['New', 'Read', 'Responded', 'Archived', 'Spam'],
    default: 'New'
  },
  // Optional: notes by admin/staff who handled the inquiry
  staffNotes: {
    type: String,
    trim: true
  },
  // Optional: who handled it
  // handledBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Admin' // or 'User'
  // }
}, { timestamps: true }); // `createdAt` will be submission time, `updatedAt` for status changes

contactInquirySchema.index({ status: 1, createdAt: -1 }); // For admins to query new inquiries

const ContactInquiry = mongoose.model('ContactInquiry', contactInquirySchema);
module.exports = ContactInquiry;