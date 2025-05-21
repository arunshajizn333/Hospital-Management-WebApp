// controllers/publicController.js
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const HospitalInfo = require('../models/HospitalInfo');
const CallbackRequest = require('../models/CallbackRequest');
const ContactInquiry = require('../models/ContactInquiry');
const mongoose = require('mongoose'); // Used for ObjectId.isValid

/**
 * @desc    Get all active medical departments
 * @route   GET /api/public/departments
 * @access  Public
 */
exports.getAllDepartments = async (req, res) => {
  try {
    // Fetches all departments, sorted by name. 
    // Future consideration: Add an 'active' flag to the Department model for filtering.
    const departments = await Department.find().sort({ name: 1 }); 
    res.status(200).json({
      message: 'Departments retrieved successfully.',
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error('Error fetching departments:', error.message);
    res.status(500).json({ message: 'Server Error while fetching departments.' });
  }
};

/**
 * @desc    Get a list of doctors for public view, with optional filters and pagination.
 * @route   GET /api/public/doctors
 * @access  Public
 */
exports.getPublicDoctorsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { specialization, name, departmentId } = req.query;
    const query = {};

    if (specialization) {
      // Case-insensitive search for specialization
      query.specialization = { $regex: new RegExp(specialization, 'i') };
    }
    if (name) {
      // Case-insensitive search for doctor's name
      query.name = { $regex: new RegExp(name, 'i') };
    }
    if (departmentId) {
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({ message: 'Invalid Department ID format for filter.' });
      }
      query.department = departmentId; // Filter by department ID
    }
    
    // Defines fields to be exposed publicly for doctors
    const publicDoctorFields = '_id name specialization photoUrl publicBio department';

    const totalDoctors = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('department', 'name') // Populate department name for display
      .select(publicDoctorFields)     // Select only designated public fields
      .sort({ name: 1 })              // Sort by doctor name
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: 'Doctors retrieved successfully.',
      count: doctors.length,
      total: totalDoctors,
      currentPage: page,
      totalPages: Math.ceil(totalDoctors / limit),
      doctors,
    });
  } catch (error) {
    console.error('Error fetching public doctors list:', error.message);
    res.status(500).json({ message: 'Server Error while fetching doctors list.' });
  }
};

/**
 * @desc    Get a list of featured doctors.
 * @route   GET /api/public/doctors/featured
 * @access  Public
 */
exports.getFeaturedDoctors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5; // Default number of featured doctors
    const publicDoctorFields = '_id name specialization photoUrl publicBio department';

    // Fetches doctors marked with 'isFeatured: true' in their profile.
    const doctors = await Doctor.find({ isFeatured: true })
        .populate('department', 'name') // Populate department name
        .select(publicDoctorFields)
        .limit(limit);
    
    // Optional: Fallback logic if no doctors are marked as featured.
    // Currently, it will return an empty list if none are explicitly featured.

    res.status(200).json({
      message: 'Featured doctors retrieved successfully.',
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error('Error fetching featured doctors:', error.message);
    res.status(500).json({ message: 'Server Error while fetching featured doctors.' });
  }
};

/**
 * @desc    Get public details of a specific doctor by their ID.
 * @route   GET /api/public/doctors/:doctorId
 * @access  Public
 */
exports.getPublicDoctorProfile = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: 'Invalid Doctor ID format.' });
        }

        const publicDoctorFields = '_id name specialization photoUrl publicBio department';
        const doctor = await Doctor.findById(doctorId)
            .populate('department', 'name description') // Populate linked department details
            .select(publicDoctorFields);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        res.status(200).json({ doctor });

    } catch (error) {
        console.error('Error fetching public doctor profile:', error.message);
        // Handle specific CastError for ObjectId during query, though isValid check should catch most format issues
        if (error.kind === 'ObjectId' && error.name === 'CastError') { 
             return res.status(400).json({ message: 'Invalid Doctor ID format provided for query.' });
        }
        res.status(500).json({ message: 'Server Error while fetching public doctor profile.' });
    }
};

/**
 * @desc    Get general hospital information and statistics.
 * @route   GET /api/public/hospital-info
 * @access  Public
 */
exports.getHospitalInfo = async (req, res) => {
  try {
    // Assumes a single document in the HospitalInfo collection holds this data.
    // If multiple exist (by mistake), it will pick the first one found.
    // Admin interface should enforce editing/creating only one such document.
    let info = await HospitalInfo.findOne();

    if (!info) {
      // Fallback to default information if none is configured in the database.
      // This indicates an admin needs to set up this information via an admin panel.
      return res.status(200).json({
        message: 'Hospital information not yet configured. Displaying default information.',
        hospitalInfo: { // Default placeholder data
            siteName: "Community Health Center",
            headline: "Your Health, Our Priority.",
            introductoryParagraph: "Established in 2005, Community Health Center has been dedicated to providing quality healthcare services to our local community with compassion and expertise.",
            keyStatistics: [
              { "label": "Years of Service", "value": "15+", "description": "Serving the community for over fifteen years.", "iconUrl": "/icons/years_service.png" },
              { "label": "Qualified Doctors", "value": "50+", "description": "A team of experienced and dedicated medical professionals.", "iconUrl": "/icons/doctors.png" },
              { "label": "Successful Recoveries", "value": "10,000+", "description": "Helping patients get back to their healthy lives.", "iconUrl": "/icons/recoveries.png" }
            ],
            concludingStatement: "We are committed to your well-being. Trust us with your care.",
            address: "123 Health St, Wellness City, HC 45678",
            generalPhoneNumber: "555-123-4567",
            emergencyPhoneNumber: "555-911-0000",
            generalEmail: "info@communityhealth.com"
        }
      });
    }

    res.status(200).json({
      message: 'Hospital information retrieved successfully.',
      hospitalInfo: info,
    });
  } catch (error) {
    console.error('Error fetching hospital information:', error.message);
    res.status(500).json({ message: 'Server Error while fetching hospital information.' });
  }
};

/**
 * @desc    Submit a user request for a callback from the hospital.
 * @route   POST /api/public/callbacks
 * @access  Public
 */
exports.handleCallbackRequest = async (req, res) => {
  try {
    const { name, phoneNumber, preferredTime, reason } = req.body;

    // Basic validation for required fields
    if (!name || !phoneNumber) {
      return res.status(400).json({ message: 'Name and phone number are required for callback request.' });
    }
    // Note: More specific phone number format validation is in the CallbackRequest model schema.

    const newCallbackRequest = new CallbackRequest({
      name,
      phoneNumber,
      preferredTime,
      reason,
      status: 'Pending' // Initial status for new requests
    });

    await newCallbackRequest.save();

    // Optional: Implement notification (e.g., email to admin) about the new request in a future iteration.

    res.status(201).json({
      message: 'Your callback request has been submitted successfully. We will contact you shortly.',
      // Optionally send back parts of the request for confirmation, excluding sensitive or internal fields
      request: {
          name: newCallbackRequest.name,
          phoneNumber: newCallbackRequest.phoneNumber, // Consider if this should be returned
          preferredTime: newCallbackRequest.preferredTime,
          submittedAt: newCallbackRequest.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting callback request:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error while submitting callback request.' });
  }
};

/**
 * @desc    Submit a general contact inquiry from the public.
 * @route   POST /api/public/contact-inquiries
 * @access  Public
 */
exports.handleContactInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation for required fields
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required for contact inquiry.' });
    }

    const newInquiry = new ContactInquiry({
      name,
      email,
      subject: subject || 'General Inquiry', // Provide a default subject if none is given
      message,
      status: 'New' // Initial status for new inquiries
    });

    await newInquiry.save();

    // Optional: Implement notification (e.g., email to hospital's contact address) in a future iteration.

    res.status(201).json({
      message: 'Your inquiry has been submitted successfully. We will get back to you as soon as possible.',
      inquiry: { // Return some details of the submitted inquiry for confirmation
          name: newInquiry.name,
          email: newInquiry.email,
          subject: newInquiry.subject,
          submittedAt: newInquiry.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting contact inquiry:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error while submitting contact inquiry.' });
  }
};