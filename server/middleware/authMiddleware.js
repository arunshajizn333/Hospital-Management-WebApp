// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
require('dotenv').config(); // Ensures process.env variables are loaded

/**
 * @desc Middleware to protect routes by verifying JWT and attaching user to request object.
 * This function checks for a JWT in the 'Authorization' header, verifies it,
 * and then fetches the user from the appropriate database collection based on the role
 * encoded in the token.
 * @access Private (to be used on routes that require user authentication)
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check if the 'Authorization' header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from the "Bearer <token>" string
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // 'decoded' payload will contain { id: 'userId', role: 'userRole', iat: ..., exp: ... }

      // Fetch user details from the database based on the role in the decoded token
      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'doctor') {
        req.user = await Doctor.findById(decoded.id).select('-password');
      } else if (decoded.role === 'patient') {
        req.user = await Patient.findById(decoded.id).select('-password');
      } else {
        // If the role in the token is not recognized by this application
        return res.status(401).json({ message: 'Not authorized: Unrecognized user role in token.' });
      }

      // Check if a user was actually found with the ID from the token
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized: User belonging to this token no longer exists.' });
      }
      
      // Explicitly set the role on req.user from the decoded token.
      // This ensures consistency, especially if a user's role in the DB could somehow differ
      // from what was encoded at token issuance (though typically they should align).
      req.user.role = decoded.role;

      next(); // User is authenticated, proceed to the next middleware or route handler
    } catch (error) {
      // Handle various JWT-related errors
      console.error('Token verification error:', error.message);
      let message = 'Not authorized: Token failed.'; // Default message
      if (error.name === 'JsonWebTokenError') {
        message = 'Not authorized: Invalid token.';
      } else if (error.name === 'TokenExpiredError') {
        message = 'Not authorized: Token has expired. Please log in again.';
      }
      return res.status(401).json({ message });
    }
  }

  // If no token was found in the Authorization header
  if (!token) {
    res.status(401).json({ message: 'Not authorized: No token provided.' });
  }
};

/**
 * @desc Middleware to authorize users based on their roles.
 * This function should be used *after* the 'protect' middleware,
 * as it relies on `req.user` and `req.user.role` being set.
 * @param {...String} roles - A list of roles allowed to access the route (e.g., 'admin', 'doctor').
 * @access Private (to be used on routes that require specific user roles)
 */
exports.authorize = (...roles) => { // Accepts a list of allowed roles
  return (req, res, next) => {
    // Check if req.user and req.user.role exist (should be set by 'protect' middleware)
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: 'User role not available for authorization. Ensure authentication middleware runs first.' });
    }
    
    // Check if the authenticated user's role is included in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ // 403 Forbidden status
        message: `Access denied: User role '${req.user.role}' is not authorized to access this route. Allowed roles: ${roles.join(', ')}.`,
      });
    }
    next(); // User has an authorized role, proceed to the next middleware or route handler
  };
};