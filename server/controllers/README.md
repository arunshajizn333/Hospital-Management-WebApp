Backend API Controllers Documentation
This document provides an overview of the controllers used in the Hospital Management System backend, their associated API routes, and the functionalities they provide.

1. Public Controller (controllers/publicController.js)
Handles publicly accessible API endpoints, primarily for the hospital's homepage and general information. No authentication is typically required for these routes.

API Endpoints & Functions:

GET /api/public/departments

Function: exports.getAllDepartments
Description: Retrieves a list of all active medical departments available in the hospital, sorted by name. This is used to display available departments to the public.
GET /api/public/doctors

Function: exports.getPublicDoctorsList
Description: Fetches a paginated list of doctors with publicly viewable information (name, specialization, photo URL, public bio, department). Allows filtering by specialization, name, and department ID. Useful for "Find a Doctor" features.
GET /api/public/doctors/featured

Function: exports.getFeaturedDoctors
Description: Retrieves a limited list of doctors marked as "featured" (e.g., for homepage display). Includes public profile information and department.
GET /api/public/doctors/:doctorId

Function: exports.getPublicDoctorProfile
Description: Fetches the public profile details (name, specialization, photo URL, public bio, department details) for a specific doctor by their ID.
GET /api/public/hospital-info

Function: exports.getHospitalInfo
Description: Retrieves general information about the hospital, such as site name, headline, introductory paragraphs, key statistics, and contact details. Returns default information if none is configured by an admin.
POST /api/public/callbacks

Function: exports.handleCallbackRequest
Description: Allows public users to submit a request for a callback from the hospital. Captures name, phone number, preferred time, and reason. Stores the request for admin review.
POST /api/public/contact-inquiries

Function: exports.handleContactInquiry
Description: Allows public users to submit a general contact inquiry form. Captures name, email, subject, and message. Stores the inquiry for admin review.
2. Admin Controller (controllers/adminController.js)
Manages administrative functionalities, including CRUD operations for core entities like Departments and Doctors, site settings, and oversight of user-submitted requests. All routes handled by this controller require Admin authentication and authorization.

API Endpoints & Functions:

Department Management:
POST /api/admin/departments
Function: exports.createDepartment
Description: Allows an admin to create a new medical department, providing details like name, description, image URL, and services offered.
GET /api/admin/departments
Function: exports.getDepartmentsForAdmin
Description: Retrieves a paginated list of all departments, with options for filtering (e.g., by name), for administrative purposes.
GET /api/admin/departments/:departmentId
Function: exports.getDepartmentByIdForAdmin
Description: Allows an admin to fetch the full details of a specific department by its ID.
PUT /api/admin/departments/:departmentId
Function: exports.updateDepartmentByAdmin
Description: Allows an admin to update the details of an existing department.
DELETE /api/admin/departments/:departmentId
Function: exports.deleteDepartmentByAdmin
Description: Allows an admin to delete a department. Includes a TODO to consider linked doctors in future enhancements.
Hospital Information Management:
PUT /api/admin/hospital-info
Function: exports.updateHospitalInfoByAdmin
Description: Allows an admin to update (or create if it doesn't exist) the general hospital information (site name, headline, statistics, contact details, etc.).
Callback Request Management:
GET /api/admin/callbacks
Function: exports.getCallbackRequestsByAdmin
Description: Retrieves a paginated and filterable list of all callback requests submitted by users.
PUT /api/admin/callbacks/:callbackId/status
Function: exports.updateCallbackRequestStatusByAdmin
Description: Allows an admin to update the status (e.g., 'Pending', 'Contacted', 'Resolved') and add staff notes to a callback request.
Contact Inquiry Management:
GET /api/admin/contact-inquiries
Function: exports.getContactInquiriesByAdmin
Description: Retrieves a paginated and filterable list of all contact inquiries submitted by users.
PUT /api/admin/contact-inquiries/:inquiryId/status
Function: exports.updateContactInquiryStatusByAdmin
Description: Allows an admin to update the status (e.g., 'New', 'Read', 'Responded') and add staff notes to a contact inquiry.
Doctor Management by Admin:
POST /api/admin/doctors
Function: exports.createDoctorByAdmin
Description: Allows an admin to create a new doctor profile, including assigning a department, setting a password, and specifying public profile details (photo, bio, featured status) and availability.
GET /api/admin/doctors
Function: exports.getDoctorsForAdmin
Description: Retrieves a paginated list of all doctors, with options for filtering (name, specialization, department ID), and populates department information.
GET /api/admin/doctors/:doctorId
Function: exports.getDoctorByIdForAdmin
Description: Allows an admin to fetch the full details of a specific doctor, including populated department information.
PUT /api/admin/doctors/:doctorId
Function: exports.updateDoctorByAdmin
Description: Allows an admin to update a doctor's details, including their assigned department, role, availability schedule, and public profile information.
DELETE /api/admin/doctors/:doctorId
Function: exports.deleteDoctorByAdmin
Description: Allows an admin to delete a doctor. Includes a TODO regarding handling of associated appointments.
Admin Analytics:
GET /api/admin/analytics/patient-summary
Function: exports.getPatientSummaryForAdmin
Description: Provides a summary of patient statistics, such as total registered patients and the number of unique patients who have booked appointments.
GET /api/admin/analytics/doctor-appointment-summary
Function: exports.getDoctorAppointmentSummaryForAdmin
Description: Provides a summary of appointment counts (total, scheduled, confirmed, completed, cancelled) for each doctor.