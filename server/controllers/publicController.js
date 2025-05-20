// controllers/publicController.js
const Department = require('../models/Department');
const Doctor = require('../models/Doctor'); // --- ADD THIS LINE ---
// We'll import other models like CallbackRequest, ContactInquiry later

// @desc    Get all active medical departments
// @route   GET /api/public/departments
// @access  Public
exports.getAllDepartments = async (req, res) => {
  try {
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

// --- NEW PUBLIC DOCTOR CONTROLLERS ---

// @desc    Get a list of doctors (public view) with optional filters
// @route   GET /api/public/doctors
// @access  Public
exports.getPublicDoctorsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { specialization, name } = req.query; // Add more filters as needed
    const query = {};

    if (specialization) {
      // Case-insensitive search for specialization
      query.specialization = { $regex: new RegExp(specialization, 'i') };
    }
    if (name) {
      query.name = { $regex: new RegExp(name, 'i') };
    }
    
    // Add a filter for department if you link Doctors to Departments later
    // if (req.query.departmentId) query.department = req.query.departmentId;

    const publicDoctorFields = 'name specialization'; // Add photoUrl, publicBio when available
    // For now, you might also want to expose the Doctor's _id so frontend can link to their profile
    // const publicDoctorFields = '_id name specialization';


    const totalDoctors = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .select(publicDoctorFields) // Only select public fields
      .sort({ name: 1 }) // Sort by name
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
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get a list of featured doctors
// @route   GET /api/public/doctors/featured
// @access  Public
exports.getFeaturedDoctors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5; // Default to 5 featured doctors
    const publicDoctorFields = 'name specialization'; // Add _id, photoUrl, publicBio when available

    // Strategy for "featured":
    // 1. If you add an `isFeatured: true` field to Doctor model:
    //    const doctors = await Doctor.find({ isFeatured: true }).select(publicDoctorFields).limit(limit);
    // 2. For now, let's just take a few, sorted by name (or createdAt for "newest")
    const doctors = await Doctor.find({})
        .select(publicDoctorFields)
        .sort({ createdAt: -1 }) // Example: newest doctors as "featured"
        .limit(limit);

    res.status(200).json({
      message: 'Featured doctors retrieved successfully.',
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error('Error fetching featured doctors:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get public details of a specific doctor
// @route   GET /api/public/doctors/:doctorId
// @access  Public
exports.getPublicDoctorProfile = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: 'Invalid Doctor ID format.' });
        }

        const publicDoctorFields = 'name specialization'; // Add more fields like publicBio, photoUrl, department name (via populate if linked)
        const doctor = await Doctor.findById(doctorId).select(publicDoctorFields);
        // If Doctor model gets a 'department' field:
        // const doctor = await Doctor.findById(doctorId).select(publicDoctorFields).populate('department', 'name');


        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        res.status(200).json({ doctor });

    } catch (error) {
        console.error('Error fetching public doctor profile:', error.message);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid Doctor ID format (during query).' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getHospitalInfo = async (req, res) => {
  try {
    // Assuming there's only one document for hospital info.
    // We find one. If multiple exist by mistake, it will pick the first one found.
    // Admins should ideally only create/edit one such document.
    let info = await HospitalInfo.findOne();

    if (!info) {
      // If no info is found in the DB, you can return defaults or an empty object
      // This indicates it needs to be set up by an Admin.
      return res.status(200).json({
        message: 'Hospital information not yet configured.',
        hospitalInfo: {
  "siteName": "Community Health Center",
  "headline": "Your Health, Our Priority.",
  "introductoryParagraph": "Established in 2005, Community Health Center has been dedicated to providing quality healthcare services to our local community with compassion and expertise.",
  "keyStatistics": [
    { "label": "Years of Service", "value": "15+", "description": "Serving the community for over fifteen years.", "iconUrl": "/icons/years_service.png" },
    { "label": "Qualified Doctors", "value": "50+", "description": "A team of experienced and dedicated medical professionals.", "iconUrl": "/icons/doctors.png" },
    { "label": "Successful Recoveries", "value": "10,000+", "description": "Helping patients get back to their healthy lives.", "iconUrl": "/icons/recoveries.png" }
  ],
  "concludingStatement": "We are committed to your well-being. Trust us with your care.",
  "address": "123 Health St, Wellness City, HC 45678",
  "generalPhoneNumber": "555-123-4567",
  "emergencyPhoneNumber": "555-911-0000",
  "generalEmail": "info@communityhealth.com"
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

exports.handleCallbackRequest = async (req, res) => {
  try {
    const { name, phoneNumber, preferredTime, reason } = req.body;

    // Basic Validation
    if (!name || !phoneNumber) {
      return res.status(400).json({ message: 'Name and phone number are required.' });
    }

    // More specific phone number validation could be added here if the schema's regex isn't enough

    const newCallbackRequest = new CallbackRequest({
      name,
      phoneNumber,
      preferredTime,
      reason,
      status: 'Pending' // Default status
    });

    await newCallbackRequest.save();

    // Optional: Send a notification (email/SMS) to the admin/relevant department here.
    // This is an advanced feature. For now, we just save to DB.

    res.status(201).json({
      message: 'Your callback request has been submitted successfully. We will contact you shortly.',
      request: { // Send back some details of what was submitted
          name: newCallbackRequest.name,
          phoneNumber: newCallbackRequest.phoneNumber,
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
    res.status(500).json({ message: 'Server Error while submitting your request.' });
  }
};

// @desc    Submit a general contact inquiry
// @route   POST /api/public/contact-inquiries
// @access  Public
exports.handleContactInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const newInquiry = new ContactInquiry({
      name,
      email,
      subject: subject || 'General Inquiry', // Use default if subject is not provided
      message,
      status: 'New' // Default status
    });
    

    await newInquiry.save();

    // Optional: Send an email notification to the hospital's contact email address.
    // This is an advanced feature and requires an email sending setup.

    res.status(201).json({
      message: 'Your inquiry has been submitted successfully. We will get back to you as soon as possible.',
      inquiry: { // Send back some details of what was submitted
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
    res.status(500).json({ message: 'Server Error while submitting your inquiry.' });
  }
};


// We'll add other public controller functions here