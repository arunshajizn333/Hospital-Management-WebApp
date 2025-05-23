// src/app/core/services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Adjust path if needed
// Assuming you have an Appointment model/interface for the frontend
import { Appointment, AppointmentsApiResponse } from '../../shared/models/appointment.model'; // Adjust path if needed

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiBaseUrl}/appointments`; // Base URL for appointment endpoints

  constructor(private http: HttpClient) { }

  /**
   * Gets the current authenticated patient's appointments.
   * Allows filtering by status and sorting.
   * @param status Optional status to filter by (e.g., 'Scheduled', 'Completed')
   * @param sort Optional sort order (e.g., 'upcoming', 'past')
   * @param limit Optional limit for the number of appointments to fetch
   */
  getMyPatientAppointments(status?: string, sort?: string, limit?: number): Observable<Appointment[]> {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }
    if (sort) {
      params = params.append('sort', sort);
    }
    if (limit !== undefined) {
      params = params.append('limit', limit.toString());
    }

    // The backend route for patient's own appointments is GET /api/appointments/my
    const requestUrl = `${this.apiUrl}/my`;
    console.log(`Requesting patient appointments from: ${requestUrl} with params:`, params.toString());

    return this.http.get<AppointmentsApiResponse>(requestUrl, { params })
      .pipe(
        map(response => response.appointments), // Assuming backend returns { appointments: [...] }
        catchError(this.handleError)
      );
  }

  // Add other appointment-related methods here later:
  // bookAppointment(appointmentData: any): Observable<Appointment> { ... }
  // updatePatientAppointment(appointmentId: string, updateData: any): Observable<Appointment> { ... }
  // cancelPatientAppointment(appointmentId: string): Observable<any> { ... }
  // getAppointmentById(appointmentId: string): Observable<Appointment> { ... }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred with an appointment operation!';
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
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}