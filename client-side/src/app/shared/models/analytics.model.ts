export interface PatientSummaryAnalytics {
    message?: string;
    summary: {
        totalRegisteredPatients: number;
        numberOfUniquePatientsWithAppointments: number;
        // Add other patient stats your backend provides
    };
}
export interface PatientSummary {
    totalRegisteredPatients: number;
    numberOfUniquePatientsWithAppointments: number;
    // Add other patient stats your backend provides
}

export interface DoctorAppointmentSummaryAnalytics {
    message?: string;
    summary: Array<{ // Array of doctor summaries
        doctorId: string;
        name: string;
        specialization?: string;
        email?: string;
        counts: {
            total: number;
            scheduled: number;
            confirmed: number;
            completed: number;
            cancelled: number;
        };
    }>;
    totalDoctors?: number;
}
export interface DoctorAppointmentCounts {
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}
export interface DoctorSummary {
    doctorId: string;
    name: string;
    specialization?: string;
    email?: string;
    counts: DoctorAppointmentCounts;
}