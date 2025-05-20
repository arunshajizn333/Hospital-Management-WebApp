// models/HospitalInfo.js
const mongoose = require('mongoose');

const keyStatisticSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g., "Hospitals", "Doctors"
  value: { type: String, required: true }, // e.g., "73+", "11,000+"
  description: { type: String, required: true },
  iconUrl: { type: String } // Optional: URL for an icon/image
}, {_id: false});

const hospitalInfoSchema = new mongoose.Schema({
  siteName: { // e.g., "Apollo Hospitals"
    type: String,
    required: true,
    default: "Our Hospital Name"
  },
  headline: { // e.g., "Where Excellence Meets Compassion"
    type: String,
    required: true,
    trim: true,
  },
  introductoryParagraph: {
    type: String,
    required: true,
    trim: true,
  },
  keyStatistics: [keyStatisticSchema],
  concludingStatement: {
    type: String,
    trim: true,
  },
  // Contact details often shown in "About Us" or "Contact Us"
  // but can be part of general hospital info too.
  address: { type: String, trim: true },
  generalPhoneNumber: { type: String, trim: true },
  emergencyPhoneNumber: { type: String, trim: true },
  generalEmail: { type: String, trim: true, lowercase: true },
  // You might add mission, vision, etc.
  // lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' } // To track who updated it
}, { timestamps: true }); // To track when it was last updated

// Ensure only one document for hospital info (singleton pattern)
// This can be enforced at the application level (e.g., admin interface only allows editing one)
// Or with a unique index on a fixed field if desired, though often not necessary for single-doc collections.

const HospitalInfo = mongoose.model('HospitalInfo', hospitalInfoSchema);
module.exports = HospitalInfo;