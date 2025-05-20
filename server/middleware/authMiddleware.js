// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin'); // --- ADD THIS LINE: Import the Admin model ---
require('dotenv').config();

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer token_string")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // 'decoded' will contain { id: 'userId', role: 'userRole', iat: ..., exp: ... }

      // Fetch user based on the role stored in the token
      if (decoded.role === 'admin') { // --- ADD THIS BLOCK FOR ADMIN ---
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'doctor') {
        req.user = await Doctor.findById(decoded.id).select('-password');
      } else if (decoded.role === 'patient') {
        req.user = await Patient.findById(decoded.id).select('-password');
      } else {
        // If the role in the token is not one we recognize
        return res.status(401).json({ message: 'Not authorized, unrecognized user role in token' });
      }

      // Check if user was actually found in DB for that ID and role
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found for this token' });
      }
      
      // Explicitly set the role on req.user from the decoded token.
      // This is important because the document fetched from DB might have a default role,
      // but the token's role is what was granted at login. For Admin, it's fixed anyway.
      req.user.role = decoded.role;

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification error:', error.message);
      let message = 'Not authorized, token failed';
      if (error.name === 'JsonWebTokenError') {
        message = 'Not authorized, invalid token';
      } else if (error.name === 'TokenExpiredError') {
        message = 'Not authorized, token expired';
      }
      return res.status(401).json({ message });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Authorization middleware (checks roles) - this remains the same
exports.authorize = (...roles) => { // e.g. authorize('admin', 'doctor')
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: 'User role not available for authorization.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};