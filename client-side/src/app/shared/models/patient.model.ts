// src/app/shared/models/patient.model.ts

// Define this or import if already defined elsewhere in a similar way
export interface PopulatedDoctorInfo {
  _id: string;
  name: string;
  specialization?: string; // Make this optional to match backend's select behavior
}

export interface MedicalRecordEntry {
  _id?: string;
  date: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  doctorAttended?: PopulatedDoctorInfo | string; // Use the more specific populated type or string ID
  entryDate?: string;
}

export interface Patient {
  _id: string;
  name: string;
  email: string;
  role: 'patient';
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  contact?: {
    phone?: string;
    address?: string;
  };
  medicalHistory?: MedicalRecordEntry[];
  createdAt?: string;
  updatedAt?: string;
}
// ... other API response interfaces ...