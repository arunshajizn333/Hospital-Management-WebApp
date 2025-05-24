// src/app/shared/models/appointment.model.ts

import { Patient } from './patient.model';
import { Doctor } from './doctor.model';
export interface Appointment {
  _id: string;
  patient: Patient | string;
  doctor: Doctor | string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'CancelledByPatient' | 'CancelledByDoctor' | 'CancelledByAdmin' | 'NoShow';
  patientNotes?: string;
  doctorNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentsApiResponse {
    message?: string;
    count?: number; // Number of items on the current page
    appointments: Appointment[];
    total?: number;         // Total items matching query
    currentPage?: number;   // Current page number
    totalPages?: number;    // Total number of pages
}

export interface BookAppointmentResponse { // For when booking an appointment
    message: string;
    appointment: Appointment;
}