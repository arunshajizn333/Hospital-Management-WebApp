// src/app/shared/models/doctor.model.ts
import { Department } from './department.model';

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface BreakTime {
  _id?: string;
  breakStart: string; // HH:MM
  breakEnd: string;   // HH:MM
}

export interface DailyAvailability {
  _id?: string;
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  slotDurationMinutes?: number;
  breakTimes?: BreakTime[];
}

export interface DateOverride {
  _id?: string;
  date: string; // Should be ISO string date part YYYY-MM-DD when sending to form, Date object from backend
  isAvailable: boolean;
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  slotDurationMinutes?: number;
  breakTimes?: BreakTime[];
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization?: string; // Made optional if backend select might omit it, but admin form requires it
  department?: Department | string; // Can be populated Department object or just ID string
  phone?: string;
  photoUrl?: string;
  publicBio?: string;
  isFeatured?: boolean;
  role?: 'doctor' | 'admin';
  availabilitySchedule?: DailyAvailability[];
  availabilityOverrides?: DateOverride[];
  createdAt?: string;
  updatedAt?: string;
  // password field is not here as it's write-only or handled by backend
}

export interface DoctorsApiResponse {
    message?: string;
    count?: number;
    total?: number;
    currentPage?: number;
    totalPages?: number;
    doctors: Doctor[];
}

// This payload is for Admin creating/updating a doctor
export interface AdminDoctorPayload {
  name: string;
  email: string;
  password?: string; // Only for create
  specialization: string;
  phone?: string;
  department?: string | null; // departmentId
  photoUrl?: string;
  publicBio?: string;
  isFeatured?: boolean;
  role?: 'doctor' | 'admin';
  availabilitySchedule?: DailyAvailability[];
  availabilityOverrides?: DateOverride[];
}
export interface PopulatedDoctorInfo { // Add this if not present
    _id: string;
    name: string;
    specialization?: string; // Specialization can be optional in a summary view
}