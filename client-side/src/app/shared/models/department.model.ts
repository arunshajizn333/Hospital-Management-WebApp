// src/app/shared/models/department.model.ts
export interface Department {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  servicesOffered?: string[];
  createdAt?: string;
  updatedAt?: string;
  // active?: boolean; // If you add this
}

export interface DepartmentsApiResponse {
  message?: string;
  count: number;          // Number of items on the current page
  departments: Department[];
  total?: number;        // <<< ADD OR ENSURE THIS EXISTS (Total items matching query)
  currentPage?: number;  // <<< ADD OR ENSURE THIS EXISTS (Current page number)
  totalPages?: number;   // <<< ADD OR ENSURE THIS EXISTS (Total number of pages)
}