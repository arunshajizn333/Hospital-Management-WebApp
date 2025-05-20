// models/Department.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required.'],
    unique: true, // This already creates an index for the 'name' field
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Department description cannot exceed 1000 characters.']
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  servicesOffered: [{
    type: String,
    trim: true,
  }],
  // headOfDepartment: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Doctor'
  // },
  // active: {
  //   type: Boolean,
  //   default: true
  // }
}, { timestamps: true });

// departmentSchema.index({ name: 1 }); // <<< REMOVE THIS LINE

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;