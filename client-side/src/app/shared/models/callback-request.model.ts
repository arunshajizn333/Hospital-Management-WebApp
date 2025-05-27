// src/app/shared/models/callback-request.model.ts
export interface CallbackRequestData {
  name: string;
  phoneNumber: string;
  preferredTime?: string;
  reason?: string;
}

export interface CallbackResponse { // For the backend response after submission
    message: string;
    request?: {
        name: string;
        phoneNumber: string;
        preferredTime?: string;
        submittedAt: string; // or Date
    };
}
// src/app/shared/models/callback-request.model.ts

export interface CallbackRequest {
  _id: string;
  name: string;
  phoneNumber: string;
  preferredTime?: string;
  reason?: string;
  status: 'Pending' | 'Contacted' | 'Resolved' | 'FailedAttempt'; // Match your Mongoose schema enum
  staffNotes?: string;
  // handledBy?: User | string; // If you decide to populate/store who handled it
  createdAt: string; // Will be an ISO date string from backend
  updatedAt: string; // Will be an ISO date string from backend
}

export interface CallbackRequestsApiResponse {
  message?: string;
  count: number;    // Number of items on the current page
  total: number;    // Total items matching query across all pages
  currentPage: number;
  totalPages: number;
  callbackRequests: CallbackRequest[];
}