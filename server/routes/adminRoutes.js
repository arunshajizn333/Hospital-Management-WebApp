// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Department Management by Admin ---

// @route   POST /api/admin/departments
// @desc    Admin creates a new department
router.post('/departments', protect, authorize('admin'), adminController.createDepartment);

// @route   GET /api/admin/departments
// @desc    Admin gets a list of all departments
router.get('/departments', protect, authorize('admin'), adminController.getDepartmentsForAdmin);

// @route   GET /api/admin/departments/:departmentId
// @desc    Admin gets a single department by ID
router.get('/departments/:departmentId', protect, authorize('admin'), adminController.getDepartmentByIdForAdmin);

// We'll add PUT and DELETE for departments here later.

module.exports = router;