// src/app/shared/models/doctor.model.ts
import { Department } from './department.model'; // Assuming you have a Department model

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  photoUrl?: string;
  publicBio?: string;
  department?: Department | string; // Can be populated Department object or just ID string
  // Add any other fields that your public API for doctors returns
}

// Interface for the API response when fetching multiple doctors
export interface DoctorsApiResponse {
    message: string;
    count: number;
    doctors: Doctor[];
    // Add pagination fields if your featured doctors endpoint or general list uses them
    total?: number;
    currentPage?: number;
    totalPages?: number;
}