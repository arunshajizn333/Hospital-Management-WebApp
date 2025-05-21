# Hospital Management System - Backend API

## Project Objective

To develop the backend for a comprehensive Hospital Management System using the MEAN (MongoDB, Express.js, Angular, Node.js) stack. This backend API enables seamless coordination in healthcare administration by providing essential features like managing appointments, doctors, and patient records, along with administrative controls and public-facing information endpoints.

## Technology Stack

* **Node.js:** Server-side JavaScript runtime environment.
* **Express.js:** Web application framework for Node.js, used to build the RESTful APIs.
* **MongoDB:** NoSQL database used for storing application data (doctors, patients, appointments, etc.).
* **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js, used for schema definition, validation, and database interaction.
* **JSON Web Tokens (JWT):** For securing API endpoints and managing user authentication.
* **bcryptjs:** For hashing user passwords before storing them in the database.
* **dotenv:** For managing environment variables.
* **cors:** For enabling Cross-Origin Resource Sharing.
* **helmet:** For securing the Express app by setting various HTTP headers.

## Project Structure

The backend follows a standard Node.js/Express.js project structure:

hospital-management-backend/
|-- config/
|   └── db.js               # Database connection logic (Mongoose)
|-- controllers/
|   ├── adminController.js      # Logic for admin-specific actions
|   ├── appointmentController.js # Logic for appointment management
|   ├── authController.js       # Logic for user authentication (login, register, password change)
|   ├── doctorController.js     # Logic for doctor-specific actions (e.g., availability management)
|   ├── patientController.js    # Logic for patient-specific actions & data management
|   └── publicController.js     # Logic for public-facing API endpoints
|-- middleware/
|   └── authMiddleware.js     # Authentication (protect) and Authorization (authorize) middleware
|-- models/
|   ├── Admin.js              # Mongoose model for Admin users
|   ├── Appointment.js        # Mongoose model for Appointments
|   ├── CallbackRequest.js    # Mongoose model for Callback Requests
|   ├── ContactInquiry.js     # Mongoose model for Contact Inquiries
|   ├── Department.js         # Mongoose model for Medical Departments
|   ├── Doctor.js             # Mongoose model for Doctors
|   ├── HospitalInfo.js       # Mongoose model for general Hospital Information
|   └── Patient.js            # Mongoose model for Patients
|-- routes/
|   ├── adminRoutes.js        # Routes for admin-specific functionalities
|   ├── appointmentRoutes.js  # Routes for managing appointments
|   ├── authRoutes.js         # Routes for authentication (login, register, password change)
|   ├── doctorRoutes.js       # Routes for doctor-specific actions & public doctor info
|   ├── patientRoutes.js      # Routes for patient-specific actions
|   └── publicRoutes.js       # Routes for public-facing information
|-- utils/                    # Utility functions (if any, e.g., AppError if used)
|   └── (appError.js)         # Example: Custom error class (if centralized error handling is adopted)
|-- .env                      # Environment variables (MONGO_URI, JWT_SECRET, PORT) - Not committed to Git
|-- .gitignore                # Specifies intentionally untracked files
|-- package.json              # Project metadata, dependencies, and scripts
|-- package-lock.json         # Records exact versions of dependencies
|-- seedAdmin.js              # Script to seed the initial admin user
|-- server.js                 # Main entry point: Express server setup, middleware, route mounting


## Core Features Implemented

### 1. User Roles & Authentication
* Separate models and login mechanisms for **Admin**, **Doctor**, and **Patient** roles.
* Patient self-registration.
* Secure password hashing using `bcryptjs`.
* JWT-based authentication for securing API endpoints.
* Role-based authorization to control access to specific functionalities.
* Authenticated users can change their own passwords.

### 2. Admin Functionalities
* **Doctor Management:**
    * Create, Read, Update, and Delete doctor profiles.
    * Assign doctors to departments.
    * Manage doctor's public profile details (photo URL, bio, featured status) and availability schedule.
* **Department Management:**
    * Create, Read, Update, and Delete medical departments.
* **Hospital Information Management:**
    * Update general hospital information (headline, statistics, contact details) displayed publicly.
* **Request Management:**
    * View and update the status of user-submitted callback requests.
    * View and update the status of user-submitted contact inquiries.
* **Analytics:**
    * View patient summary statistics (total registered, unique patients with appointments).
    * View doctor appointment summary statistics (counts per doctor).

### 3. Doctor Functionalities
* **Availability Management:**
    * Set and update their weekly availability schedule (working days, start/end times, slot duration, breaks).
    * Set and update date-specific overrides for their availability (e.g., for holidays, special hours).
* **Appointment Management:**
    * View their list of scheduled appointments (filterable by date, status).
    * Update the status of their appointments (e.g., 'Confirmed', 'Completed', 'NoShow').
* **Patient Record Management:**
    * Search for patients.
    * View patient profiles (those they are authorized to access).
    * Add new medical records/notes to a patient's history.
    * Create new patient profiles (e.g., for walk-ins not yet registered).

### 4. Patient Functionalities
* **Profile Management:**
    * View and update their own non-medical profile information.
    * View their medical records (as entered by doctors).
* **Appointment Management:**
    * Book new appointments with doctors, based on dynamically generated available slots.
    * View their own upcoming and past appointments.
    * Update/reschedule their own appointments (subject to system rules and availability).
    * Cancel their own appointments.

### 5. Public-Facing Information (Homepage Support)
* List available medical departments.
* List doctors (general list with filters, featured doctors list).
* View public profiles of specific doctors.
* Fetch general hospital information and statistics.
* Submit "Request a Callback" forms.
* Submit "Contact Us" inquiry forms.

### 6. Appointment System
* Dynamic generation of available appointment slots based on doctor's weekly schedule, date-specific overrides, existing appointments, and break times.
* Clash detection to prevent double booking.
* Manages various appointment statuses (Scheduled, Confirmed, Completed, Cancelled, etc.).

### 7. Security
* Basic security headers implemented using `helmet.js`.
* Secure password storage.
* Role-based access control for API endpoints.

## Setup and Installation

1.  **Prerequisites:**
    * Node.js (v14.x or higher recommended)
    * npm (Node Package Manager)
    * MongoDB (local instance or a cloud service like MongoDB Atlas)

2.  **Clone the Repository (if applicable):**
    ```bash
    git clone <your-repository-url>
    cd hospital-management-backend
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Set Up Environment Variables:**
    * Create a `.env` file in the root of the `hospital-management-backend` directory.
    * Add the following variables, replacing placeholder values with your actual configuration:
        ```env
        NODE_ENV=development
        PORT=5000
        MONGO_URI=your_mongodb_connection_string_here
        JWT_SECRET=your_very_strong_and_random_jwt_secret_key
        ```
        * `PORT`: The port on which the backend server will run (e.g., 3000 or 5000).
        * `MONGO_URI`: Your MongoDB connection string.
        * `JWT_SECRET`: A long, random, and secret string for signing JSON Web Tokens.

5.  **Seed Initial Admin User (Important for First Use):**
    * The system requires an initial admin user to manage other users and settings.
    * Modify the `seedAdmin.js` script with your desired initial admin credentials if needed.
    * Run the seeder script:
        ```bash
        node seedAdmin.js
        ```
    * *Note: For production, ensure you change the default admin password immediately after the first login.*

6.  **Seed Initial Data (Optional but Recommended for Development):**
    * You may want to seed initial departments or other data for easier development and testing. Create and run seeder scripts as needed (e.g., `seedDepartments.js`, `seedHospitalInfo.js`).

## Running the Server

* **Development Mode (with `nodemon` for auto-restarts):**
    ```bash
    npm run dev
    ```
* **Production Mode:**
    ```bash
    npm start
    ```
    The server will typically start on the port specified in your `.env` file (or default to 5000).

## API Endpoints Overview

The API is structured around roles (Admin, Doctor, Patient) and resources. Key base paths include:

* `/api/public/*` - Publicly accessible data for the homepage.
* `/api/auth/*` - Authentication routes (login, register, change password).
* `/api/admin/*` - Routes for administrative functionalities (managing doctors, departments, site info, viewing requests, analytics).
* `/api/doctors/*` - Routes for doctors (e.g., managing their own availability, viewing public doctor slots).
* `/api/patients/*` - Routes for patients (e.g., managing their own profile, doctor access to patient records).
* `/api/appointments/*` - Routes for managing appointments across different roles.

*(For detailed endpoint descriptions, refer to individual route files or future API documentation like Swagger/OpenAPI if implemented).*

## Error Handling

The API currently handles errors within each controller function, returning appropriate JSON responses and status codes. Common errors include:
* `400 Bad Request`: For invalid input, missing required fields, or validation errors.
* `401 Unauthorized`: For authentication failures (missing/invalid token, incorrect credentials).
* `403 Forbidden`: For authorization failures (user authenticated but lacks permission for the resource).
* `404 Not Found`: For requests to non-existent resources.
* `409 Conflict`: For specific conflicts like trying to book an already taken slot.
* `500 Internal Server Error`: For unexpected server-side errors.

Server-side error messages are logged to the console for debugging.

## Future Enhancements / Pending Tasks

* **Password Reset Functionality:** Implement a "Forgot Password" flow.
* **Comprehensive Input Validation:** Add route-level validation using libraries like `express-validator` or `joi`.
* **Notifications:** Implement email/SMS notifications for appointments, registrations, etc.
* **Advanced Analytics:** More detailed reporting for admins.
* **Rate Limiting:** For API security against abuse.
* **Full API Documentation:** Using Swagger/OpenAPI (user opted out for now).
* **Automated Testing:** Unit and integration tests.

---