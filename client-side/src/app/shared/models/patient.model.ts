// src/app/shared/models/patient.model.ts

// You might have a base User interface if not already defined
// export interface BaseUser {
//   _id: string;
//   name: string;
//   email: string;
//   role: 'patient' | 'doctor' | 'admin';
// }

// Interface for individual medical record entries
export interface MedicalRecordEntry {
  _id?: string; // Optional if it's a subdocument that might not always have its own ID when first created on frontend
  date: string; // Or Date, but string is common from JSON and for display
  description: string;
  diagnosis?: string;
  treatment?: string;
  doctorAttended?: { // Could be just doctorId string or a partial Doctor object
    _id: string;
    name: string;
    specialization?: string;
  } | string; // Allow for just ID or populated info
  entryDate?: string; // If using timestamps on sub-schema
}

// Patient interface for frontend use
export interface Patient { // Could extend BaseUser if you have one
  _id: string;
  name: string;
  email: string;
  role: 'patient'; // Role is fixed for a Patient object
  dateOfBirth?: string; // Store as string for form binding, convert to Date if needed
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  contact?: {
    phone?: string;
    address?: string;
  };
  medicalHistory?: MedicalRecordEntry[];
  // Add other fields from your Mongoose Patient model that the frontend will use:
  // emergencyContact?: { name: string; phone: string; relationship: string };
  // bloodGroup?: string;
  // allergies?: string[];
  // insuranceDetails?: { provider: string; policyNumber: string };
  // isActive?: boolean;
  createdAt?: string; // Dates from backend will likely be ISO strings
  updatedAt?: string;
}

// Optional: Interface for API response when fetching a single patient
export interface PatientApiResponse {
    message?: string;
    patient: Patient;
}

// Optional: Interface for API response when fetching multiple patients (e.g., for admin list)
export interface PatientsApiResponse {
    message?: string;
    count?: number;
    total?: number;
    currentPage?: number;
    totalPages?: number;
    patients: Patient[];
}