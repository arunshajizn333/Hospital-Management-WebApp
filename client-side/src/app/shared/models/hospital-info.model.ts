// src/app/shared/models/hospital-info.model.ts
export interface KeyStatistic {
  _id?: string; // Optional if it's a subdocument without its own ID in some contexts
  label: string;
  value: string;
  description: string;
  iconUrl?: string;
}

export interface HospitalInfo {
  _id?: string; // The document ID from MongoDB
  siteName: string;
  headline: string;
  introductoryParagraph: string;
  keyStatistics: KeyStatistic[];
  concludingStatement?: string;
  address?: string;
  generalPhoneNumber?: string;
  emergencyPhoneNumber?: string;
  generalEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for the API response when fetching hospital info
export interface HospitalInfoApiResponse {
    message: string;
    hospitalInfo: HospitalInfo;
}