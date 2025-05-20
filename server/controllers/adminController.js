// controllers/adminController.js
const Department = require('../models/Department');
const mongoose = require('mongoose');

// @desc    Admin creates a new department
// @route   POST /api/admin/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
  // ... (existing createDepartment code from previous step)
  try {
    const { name, description, imageUrl, servicesOffered } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Department name is required.' });
    }
    const existingDepartment = await Department.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    if (existingDepartment) {
      return res.status(400).json({ message: `Department with name '${name}' already exists.` });
    }
    const newDepartment = new Department({
      name, description, imageUrl, servicesOffered
    });
    const savedDepartment = await newDepartment.save();
    res.status(201).json({
      message: 'Department created successfully.',
      department: savedDepartment,
    });
  } catch (error) {
    console.error('Error creating department by admin:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
        return res.status(400).json({ message: `Department with name '${error.keyValue.name}' already exists (duplicate key).` });
    }
    res.status(500).json({ message: 'Server Error while creating department.' });
  }
};

// --- NEW: Get all departments for Admin (with pagination and optional filter) ---
// @desc    Admin gets a list of all departments
// @route   GET /api/admin/departments
// @access  Private (Admin)
exports.getDepartmentsForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { name } = req.query; // Optional filter by name
    const query = {};

    if (name) {
      query.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search
    }

    const totalDepartments = await Department.countDocuments(query);
    const departments = await Department.find(query)
      .sort({ name: 1 }) // Sort by name
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: 'Departments retrieved successfully for admin.',
      count: departments.length,
      total: totalDepartments,
      currentPage: page,
      totalPages: Math.ceil(totalDepartments / limit),
      departments,
    });

  } catch (error) {
    console.error('Error fetching departments for admin:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- NEW: Get a single department by ID for Admin ---
// @desc    Admin gets a single department by ID
// @route   GET /api/admin/departments/:departmentId
// @access  Private (Admin)
exports.getDepartmentByIdForAdmin = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid Department ID format.' });
    }

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    res.status(200).json({
      message: 'Department retrieved successfully for admin.',
      department,
    });

  } catch (error) {
    console.error('Error fetching department by ID for admin:', error.message);
    if (error.kind === 'ObjectId') { // Should be caught by the isValid check above
        return res.status(400).json({ message: 'Invalid Department ID format (during query).' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// We'll add PUT and DELETE for departments here later.