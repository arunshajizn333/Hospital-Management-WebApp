// src/app/shared/models/contact-inquiry.model.ts
export interface ContactInquiryData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// Interface for the backend response after submission
export interface ContactInquiryResponse {
    message: string;
    inquiry?: { // Optional, depending on what your backend returns
        name: string;
        email: string;
        subject?: string;
        submittedAt: string; // or Date
    };
}