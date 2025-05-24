import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; // Adjust path
import { Doctor, DailyAvailability, DateOverride } from '../../../shared/models/doctor.model'; // Adjust path, ensure these interfaces exist or create them

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

@Injectable({
  providedIn: 'root' // Or provide in DoctorModule if preferred for module-specific services
})
export class DoctorService {
  private apiUrl = `${environment.apiBaseUrl}/doctors`; // Base URL for doctor-specific endpoints

  constructor(private http: HttpClient) { }

  /**
   * Gets the current authenticated doctor's availability schedule and overrides.
   */
  getMyAvailability(): Observable<DoctorAvailabilityResponse> {
    const requestUrl = `${this.apiUrl}/me/availability`; // Backend: GET /api/doctors/me/availability
    console.log(`Requesting doctor availability from: ${requestUrl}`);
    return this.http.get<DoctorAvailabilityResponse>(requestUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates the current authenticated doctor's availability schedule and/or overrides.
   * @param availabilityData - The availability data to update.
   */
  updateMyAvailability(availabilityData: UpdateDoctorAvailabilityPayload): Observable<DoctorAvailabilityResponse> {
    const requestUrl = `${this.apiUrl}/me/availability`; // Backend: PUT /api/doctors/me/availability
    console.log(`Updating doctor availability at: ${requestUrl}`);
    return this.http.put<DoctorAvailabilityResponse>(requestUrl, availabilityData)
      .pipe(
        tap(response => console.log('Availability update response:', response)),
        catchError(this.handleError)
      );
  }

  // You might also add methods like getMyDoctorProfile() here later
  // getMyProfile(): Observable<Doctor> { ... }

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