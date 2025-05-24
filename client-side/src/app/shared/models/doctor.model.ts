// src/app/shared/models/doctor.model.ts
import { Department } from './department.model';

export interface BreakTime {
  breakStart: string; // HH:MM
  breakEnd: string;   // HH:MM
  _id?: string; // Mongoose might add this to subdocuments in array
}

export interface DailyAvailability {
  dayOfWeek: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'; // This is the key
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
  breakTimes?: BreakTime[];
  _id?: string;
}

export interface DateOverride {
  date: string; // Should be ISO string date part YYYY-MM-DD
  isAvailable: boolean;
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  slotDurationMinutes?: number;
  breakTimes?: BreakTime[];
  _id?: string; // Mongoose might add this to subdocuments in array
}

export interface Doctor {
  _id: string;
  name: string;
  email: string; // Usually not public, but for profile management
  specialization?: string;
  department?: Department | string;
  phone?: string;
  photoUrl?: string;
  publicBio?: string;
  isFeatured?: boolean;
  role?: 'doctor' | 'admin'; // Role based on your backend model
  availabilitySchedule?: DailyAvailability[];
  availabilityOverrides?: DateOverride[];
  // other fields like createdAt, updatedAt if needed by frontend
}

// For API responses when fetching multiple doctors (e.g., for public lists)
export interface DoctorsApiResponse {
  message?: string;
  count?: number;
  total?: number;
  currentPage?: number;
  totalPages?: number;
  doctors: Doctor[];
}