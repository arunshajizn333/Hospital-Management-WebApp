// src/app/shared/models/department.model.ts
export interface Department {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  servicesOffered?: string[];
  createdAt?: string; // Dates will likely be strings from JSON
  updatedAt?: string;
}

// Interface for the API response when fetching multiple departments
export interface DepartmentsApiResponse {
    message: string;
    count: number;
    departments: Department[];
}