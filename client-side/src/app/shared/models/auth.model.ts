// src/app/shared/models/auth.model.ts
import { User } from './user.model';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PatientRegistrationData {
  name: string;
  email: string;
  password: string;
  dateOfBirth?: string; // Optional based on your backend model
  gender?: string;      // Optional
  contact?: {           // Optional
    phone?: string;
    address?: string;
  };
}

export interface AuthResponse { // Used by both login and register if they return user & token
  message: string;
  token: string;
  user: User;
}

// You might have a more specific RegistrationResponse if it differs significantly
// export interface PatientRegistrationResponse {
//   message: string;
//   user?: User; // Might not return full user object or token if separate login is enforced
//   token?: string; 
// }
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  // confirmNewPassword is for client-side validation, not typically sent to backend
}