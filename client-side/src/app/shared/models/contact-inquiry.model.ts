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
// src/app/shared/models/contact-inquiry.model.ts

export interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'New' | 'Read' | 'Responded' | 'Archived' | 'Spam'; // Match your Mongoose schema enum
  staffNotes?: string;
  // handledBy?: User | string; // If you decide to populate/store who handled it
  createdAt: string; // Will be an ISO date string from backend
  updatedAt: string; // Will be an ISO date string from backend
}

export interface ContactInquiriesApiResponse {
  message?: string;
  count: number;    // Number of items on the current page
  total: number;    // Total items matching query across all pages
  currentPage: number;
  totalPages: number;
  contactInquiries: ContactInquiry[];
}