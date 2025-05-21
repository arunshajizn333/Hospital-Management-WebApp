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