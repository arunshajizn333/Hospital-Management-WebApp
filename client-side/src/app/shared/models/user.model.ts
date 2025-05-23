// src/app/shared/models/user.model.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin'; // Define possible roles
  // Add other common fields if necessary, or role-specific fields can be checked for
  specialization?: string; // Optional, for doctors
  // ... any other common user properties you want to store client-side
}