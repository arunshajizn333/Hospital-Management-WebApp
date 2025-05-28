# Sacred Mission Hospital - Management System

## Project Objective

To develop a comprehensive Hospital Management System using the MEAN (MongoDB, Express.js, Angular, Node.js) stack. This project aims to enable seamless coordination in healthcare administration by providing essential features for managing appointments, doctors, patient records, and overall hospital operations through dedicated user portals for patients, doctors, and administrators. [cite: 1, 2]

## Technology Stack

**Backend:**
* **Node.js:** Server-side JavaScript runtime.
* **Express.js:** Web application framework for Node.js, used for building RESTful APIs.
* **MongoDB:** NoSQL database for storing application data.
* **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js.
* **JSON Web Tokens (JWT):** For stateless authentication and securing API endpoints.
* **bcryptjs:** For hashing user passwords.
* **dotenv:** For managing environment variables.
* **cors:** For enabling Cross-Origin Resource Sharing.
* **helmet:** For securing the Express app by setting various HTTP headers.

**Frontend:**
* **Angular:** Framework for building the client-side application, user interfaces, and dashboards.
* **TypeScript:** Superset of JavaScript used for Angular development.
* **HTML & CSS:** For structuring and styling the user interface.
* **Angular Material (Optional, if used):** UI component library.
* **ngx-toastr (Optional, if used):** For user notifications.

## Core Features Implemented

### I. Public-Facing Website (Homepage & Information)
* **Comprehensive Homepage:** [cite: 2]
    * **Navbar:** Logo, navigation links (Home, Departments, Find a Doctor, About Us, Contact Us), and Patient Login/Registration (via modals). [cite: 3, 4]
    * **Hero Section:** Engaging welcome message and call-to-action (e.g., "Book an Appointment"). [cite: 5]
    * **Department Showcase:** Highlights key medical departments with descriptions. [cite: 6, 7]
    * **Featured Doctors:** Displays profiles of featured specialists (photo, name, specialization, brief bio). [cite: 8, 9]
    * **About Hospital Snippet:** Brief introduction, key hospital statistics. [cite: 10, 11, 12, 13, 14, 15]
    * **Patient Testimonials:** Displays curated patient reviews. [cite: 16, 17]
    * **Request a Callback:** Functional form for users to request a callback. [cite: 18, 19]
    * **Contact Information Display:** Shows hospital contact details and links to relevant pages. [cite: 20]
* **Dedicated Department Listing Page (`/departments`):** Allows users to view all medical departments. [cite: 7]
* **Footer:** Copyright, links to important static pages (Privacy, Terms), social media links. [cite: 22]

### II. Authentication & User Management
* **Role-Based Access Control:** Distinct functionalities and views for Patients, Doctors, and Administrators.
* **Patient Authentication:**
    * Self-registration via a modal form. [cite: 38]
    * Login via a modal form. [cite: 38]
    * Auto-login after successful registration.
* **Doctor Authentication:** Dedicated login page (`/doctor-login`).
* **Admin Authentication:** Dedicated login page (`/admin-login`). Initial admin created via a seeder script.
* **Secure Password Handling:** Passwords hashed using `bcryptjs` on the backend.
* **JWT for Session Management:** API endpoints protected using JWTs. [cite: 4]
* **Change Password Functionality:** For all authenticated users (Patients, Doctors, Admins) within their respective dashboards. [cite: 33, 39]

### III. Patient Dashboard (`/patient/...`) [cite: 38]
* **Protected Routes:** Accessible only to authenticated patients.
* **Dashboard Overview:** Personalized welcome, summary of upcoming appointments, quick action links. [cite: 38]
* **Profile Management:** View and update personal information (contact details, DOB, gender). [cite: 39]
* **Appointment Booking:** Multi-step flow to select department, doctor, view available slots (based on real-time doctor availability), and book appointments. [cite: 40, 41]
* **Appointment Management:** View upcoming and past appointments; cancel upcoming appointments. [cite: 42]
* **Medical Record Access:** View own medical history, diagnoses, and treatments as entered by doctors. [cite: 43]

### IV. Doctor Dashboard (`/doctor/...`) [cite: 31]
* **Protected Routes:** Accessible only to authenticated doctors.
* **Dashboard Overview:** Personalized welcome, summary of today's/upcoming appointments.
* **Profile Management:** View and update editable parts of their professional profile (e.g., public bio, photo, contact phone). [cite: 32]
* **Availability Management:** Comprehensive interface to set and update weekly recurring availability (working days, start/end times, slot duration, breaks) and date-specific overrides (days off, special hours). [cite: 33]
* **Appointment Management:** View full list of their appointments with filters (date, status); update appointment statuses (e.g., Confirmed, Completed, NoShow, CancelledByDoctor). [cite: 34]
* **Patient Management:**
    * List and search patients associated with them (based on appointments). [cite: 35]
    * View detailed patient profiles and their complete medical history. [cite: 37]
    * Add new medical record entries for patients (consultation notes, diagnosis, treatment). [cite: 36]

### V. Admin Dashboard (`/admin/...`) [cite: 23]
* **Protected Routes:** Accessible only to authenticated administrators.
* **Dashboard Overview:** Display key hospital analytics (patient summary, doctor appointment summary).
* **Doctor Management:** Full CRUD operations (Add, View List with pagination/filters, Edit, Delete doctors); assign departments, manage public profile fields (photo, bio, featured status), and set initial availability. [cite: 24, 25, 26]
* **Department Management:** Full CRUD operations (Add, View List with pagination, Edit, Delete departments).
* **Patient Management:** View a list of all registered patients with search/filter and pagination. (Further actions like status management are potential enhancements). [cite: 30]
* **Appointment Oversight:** View a comprehensive list of all appointments in the system with robust filtering (doctor, patient, date range, status) and pagination; manage/update appointment details. [cite: 27, 28]
* **Hospital Information Settings:** Update general hospital details (site name, headline, statistics, contact info) displayed on public pages.
* **Request Management:** View and update the status of user-submitted Callback Requests and Contact Inquiries.
* **Analytics Reporting:** View patient summary and doctor activity summary. [cite: 29]

## Project Structure Overview

**Backend (`hospital-management-backend/`):**
* `config/`: Database connection.
* `controllers/`: Request handling logic for each role/resource.
* `middleware/`: Authentication (JWT protection) and authorization (role checks).
* `models/`: Mongoose schemas and models (Admin, Appointment, CallbackRequest, ContactInquiry, Department, Doctor, HospitalInfo, Patient).
* `routes/`: API route definitions for each major resource/feature area.
* `server.js`: Main Express application setup.
* `.env`: For environment variables.
* `seedAdmin.js`: To create the initial admin user.

**Frontend (`hospital-management-frontend/`):**
* `src/app/`: Main application code.
    * `components/`: Contains UI components, organized by public, layout, auth.
    * `core/`: Singleton services (`AuthService`, `ModalManagerService`, `LoadingService`), guards (`AuthGuard`, `RoleGuard`), and HTTP interceptors (`AuthInterceptor`, `DelayInterceptor`).
    * `modules/`: Feature modules for `public-home`, `patient`, `doctor`, `admin`, each with their own components and routing, enabling lazy loading.
    * `shared/`: Shared components, directives, pipes, and data models/interfaces.
    * `services/`: (Can also be inside `core` or feature modules) Application-wide or feature-specific services (e.g., `PublicDataService`, `AppointmentService`, `DoctorService`, `AdminService`, `PatientService`).
    * `app-routing.module.ts`: Main application routes, configured for lazy loading feature modules.
    * `app.module.ts`: Root application module.
* `src/assets/`: Static assets like images.
* `src/environments/`: Environment-specific configurations.
* `src/styles.css`: Global application styles and CSS variables.

## Setup and Installation

### Backend Setup
1.  Navigate to the `hospital-management-backend` directory.
2.  Run `npm install` to install dependencies.
3.  Create a `.env` file in the backend root and configure `MONGO_URI`, `JWT_SECRET`, and `PORT`.
4.  Run `node seedAdmin.js` to create the initial admin user (check script for default credentials).

### Frontend Setup
1.  Navigate to the `hospital-management-frontend` directory.
2.  Run `npm install` to install dependencies.
3.  Configure `src/environments/environment.ts` (and `environment.prod.ts`) with the correct `apiBaseUrl` pointing to your backend (e.g., `http://localhost:5000/api` if backend runs on port 5000).

## Running the Application

1.  **Start the Backend Server:**
    * Navigate to `hospital-management-backend`.
    * Run `npm run dev` (for development with `nodemon`) or `npm start` (for production).
    * The backend will typically be available at `http://localhost:PORT_FROM_ENV` (e.g., `http://localhost:5000`).

2.  **Start the Frontend Angular Application:**
    * Navigate to `hospital-management-frontend`.
    * Run `ng serve -o` (or `npm start`).
    * The frontend will typically be available at `http://localhost:4200/`.

## API Endpoints Overview

The backend API is structured with base paths:
* `/api/public/*`: For public data (departments, doctors, hospital info, forms).
* `/api/auth/*`: For user authentication (login, registration, password changes).
* `/api/patients/*`: For patient-specific actions (profile, medical records) and some doctor/admin actions on patients.
* `/api/doctors/*`: For doctor-specific actions (availability, profile) and some admin actions on doctors.
* `/api/appointments/*`: For managing appointments (booking, viewing by role, status updates).
* `/api/admin/*`: For admin-specific management tasks (CRUD on departments, doctors; viewing all patients/appointments; analytics; settings).

*All authenticated routes are protected by JWT and role-based authorization.*

## Error Handling & User Feedback
* **Backend:** Returns appropriate HTTP status codes (400, 401, 403, 404, 500) with JSON error messages.
* **Frontend:**
    * Uses an `AuthService` and `HttpErrorResponse` handling in services to process backend errors.
    * Displays user-friendly messages for form validation, API call success/failure (Note: `ngx-toastr` integration was discussed but opted out of for now, so messages are typically inline).
    * Global loading overlay triggered by router events and HTTP requests via interceptors.
    * Individual components manage `isLoading` flags for data fetching operations.

## Potential Future Enhancements
* Dedicated "Find a Doctor" page with advanced filtering.
* Implementation of more static public pages (About Us, Contact Us, Privacy Policy).
* Password Reset ("Forgot Password") functionality.
* Toastr/Snackbar notifications for a more polished UX.
* Advanced analytics and reporting features for admins.
* More comprehensive client-side and server-side input validation.
* File uploads (e.g., doctor photos, patient documents).
* Real-time features (e.g., chat, notifications).

---
