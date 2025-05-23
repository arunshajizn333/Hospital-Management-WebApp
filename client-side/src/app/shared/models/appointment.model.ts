// src/app/shared/models/appointment.model.ts
import { Doctor } from './doctor.model'; // Assuming you have this
import { Patient } from './patient.model'; // Assuming you have this

export interface Appointment {
  _id: string;
  patient: Patient | string; // Can be populated or just ID
  doctor: Doctor | string;   // Can be populated or just ID
  appointmentDate: string; // Or Date
  appointmentTime: string;
  reason?: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'CancelledByPatient' | 'CancelledByDoctor' | 'CancelledByAdmin' | 'NoShow';
  patientNotes?: string;
  doctorNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentsApiResponse {
  message?: string; // Optional message
  count?: number;
  appointments: Appointment[];
  // Include other pagination fields if your backend sends them for this specific endpoint
}

// Example in shared/models/appointment.model.ts
export interface BookAppointmentResponse {
    message: string;
    appointment: Appointment;
}