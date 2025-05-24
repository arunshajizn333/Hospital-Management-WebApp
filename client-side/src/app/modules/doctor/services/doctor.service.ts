// src/app/modules/doctor/services/doctor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Doctor, DailyAvailability, DateOverride } from '../../../shared/models/doctor.model';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { Patient, PatientsApiResponse, MedicalRecordEntry } from '../../../shared/models/patient.model'; // Import MedicalRecordEntry

// Interface for the availability data structure from the backend
export interface DoctorAvailabilityResponse {
  message?: string;
  doctorName?: string;
  availabilitySchedule: DailyAvailability[];
  availabilityOverrides: DateOverride[];
}

// Interface for the data to send when updating availability
export interface UpdateDoctorAvailabilityPayload {
  availabilitySchedule?: DailyAvailability[];
  availabilityOverrides?: DateOverride[];
}

// Interface for the response when updating a doctor's profile (if backend sends this structure)
export interface UpdateDoctorProfileResponse {
    message: string;
    doctor: Doctor;
}
export interface MedicalRecordEntryData {
  description: string;
  diagnosis?: string;
  treatment?: string;
  // doctorAttended will be set by the backend using the logged-in doctor's ID
}


@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiBaseUrl}/doctors`; // Base URL for /api/doctors
  private doctorsApiUrl = `${environment.apiBaseUrl}/doctors`; // For doctor-specific actions
  private patientsApiUrl = `${environment.apiBaseUrl}/patients`; // For doctor actions on patients


  constructor(
    private http: HttpClient,
    private authService: AuthService // Inject AuthService
    ) { }

  getMyAvailability(): Observable<DoctorAvailabilityResponse> {
    const requestUrl = `${this.apiUrl}/me/availability`;
    return this.http.get<DoctorAvailabilityResponse>(requestUrl)
      .pipe(catchError(this.handleError));
  }

  updateMyAvailability(availabilityData: UpdateDoctorAvailabilityPayload): Observable<DoctorAvailabilityResponse> {
    const requestUrl = `${this.apiUrl}/me/availability`;
    return this.http.put<DoctorAvailabilityResponse>(requestUrl, availabilityData)
      .pipe(
        tap(response => console.log('Availability update response:', response)),
        catchError(this.handleError)
      );
  }

  // --- NEW: Get Doctor's Own Profile ---
  getMyProfile(): Observable<Doctor> {
    const requestUrl = `${this.apiUrl}/me/profile`; // Backend: GET /api/doctors/me/profile
    console.log(`Requesting own doctor profile from: ${requestUrl}`);
    return this.http.get<Doctor>(requestUrl) // Expecting direct Doctor object
      .pipe(catchError(this.handleError));
  }

  // --- NEW: Update Doctor's Own Profile ---
  updateMyProfile(profileData: Partial<Doctor>): Observable<Doctor> { // Expecting updated Doctor object in response
    const requestUrl = `${this.apiUrl}/me/profile`; // Backend: PUT /api/doctors/me/profile
    console.log(`Updating own doctor profile at: ${requestUrl}`);
    return this.http.put<UpdateDoctorProfileResponse>(requestUrl, profileData).pipe(
      map(response => response.doctor), // Extract doctor from { message, doctor }
      tap((updatedDoctor: Doctor) => {
        // Update the current user in AuthService if the data is compatible
        const currentUser = this.authService.currentUserValue;
        if (currentUser && currentUser._id === updatedDoctor._id && typeof localStorage !== 'undefined') {
          // Merge, ensuring all User interface fields are present
          const refreshedUser: User = {
            ...currentUser, // Keep existing fields like role
            name: updatedDoctor.name, // Update name
            email: updatedDoctor.email, // Update email
            // Add other fields from Doctor that are part of User interface if necessary
            // For example, if your User interface also includes specialization from Doctor:
            specialization: updatedDoctor.specialization 
          };
          localStorage.setItem('currentUser', JSON.stringify(refreshedUser));
          this.authService.updateCurrentUser(refreshedUser); // Use the public method
          console.log('Doctor profile updated and local auth state refreshed.');
        }
      }),
      catchError(this.handleError)
    );
  }

   // --- NEW: Get Doctor's List of Patients ---
  /**
   * Gets the current authenticated doctor's list of patients (based on appointments).
   * Supports search and pagination.
   * @param searchQuery Optional search term for patient name.
   * @param page Optional page number for pagination.
   * @param limit Optional limit for items per page.
   */
   getMyPatients(searchQuery?: string, page?: number, limit?: number): Observable<PatientsApiResponse> {
    // ... (existing method)
    let params = new HttpParams();
    if (searchQuery) params = params.append('search', searchQuery);
    if (page !== undefined) params = params.append('page', page.toString());
    if (limit !== undefined) params = params.append('limit', limit.toString());
    const requestUrl = `${this.doctorsApiUrl}/me/patients`;
    return this.http.get<PatientsApiResponse>(requestUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // --- NEW: Get Full Patient Details for Doctor's View ---
  getPatientDetailsForDoctorView(patientId: string): Observable<Patient> {
    // Uses the existing backend route: GET /api/patients/doctor/:patientId/profile
    const requestUrl = `${this.patientsApiUrl}/doctor/${patientId}/profile`;
    console.log(`Requesting patient details for doctor view from: ${requestUrl}`);
    return this.http.get<Patient>(requestUrl) // Expecting the full Patient object
      .pipe(catchError(this.handleError));
  }

  // --- NEW: Add Medical Record for a Patient ---
  addMedicalRecordForPatient(patientId: string, recordData: MedicalRecordEntryData): Observable<MedicalRecordEntry> {
    // Uses the existing backend route: POST /api/patients/doctor/:patientId/medical-records
    const requestUrl = `${this.patientsApiUrl}/doctor/${patientId}/medical-records`;
    console.log(`Adding medical record for patient ${patientId} at: ${requestUrl}`, recordData);
    // Backend is expected to return the newly created medical record entry
    return this.http.post<MedicalRecordEntry>(requestUrl, recordData)
      .pipe(
        tap(newRecord => console.log('Medical record added successfully:', newRecord)),
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred with a doctor data operation!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Could not connect to the server. Please check your network connection.';
      } else if (error.error && error.error.message) {
        errorMessage = `${error.error.message}`;
      } else {
        errorMessage = `Server error: ${error.status} - ${error.statusText || 'Unknown server error'}`;
      }
    }
    console.error("DoctorService Error:", errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}