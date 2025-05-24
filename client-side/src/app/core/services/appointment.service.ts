// src/app/core/services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Appointment, AppointmentsApiResponse, BookAppointmentResponse } from '../../shared/models/appointment.model'; // Adjust path
import { Doctor } from '../../shared/models/doctor.model'; // For doctor details if needed

// Interface for data needed to book an appointment
export interface BookAppointmentData {
  doctorId: string;
  appointmentDate: string; // Should be in YYYY-MM-DD format for backend
  appointmentTime: string; // e.g., "10:00"
  reason?: string;
  patientNotes?: string;
}

// Interface for data needed to update appointment status by doctor
export interface UpdateAppointmentStatusData {
  status: 'Confirmed' | 'Completed' | 'NoShow' | 'CancelledByDoctor'; // Define allowed statuses
  doctorNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiBaseUrl}/appointments`;

  constructor(private http: HttpClient) { }

  /**
   * Gets the current authenticated patient's appointments.
   */
  getMyPatientAppointments(status?: string, sort?: string, limit?: number): Observable<Appointment[]> {
    let params = new HttpParams();
    if (status) params = params.append('status', status);
    if (sort) params = params.append('sort', sort);
    if (limit !== undefined) params = params.append('limit', limit.toString());

    const requestUrl = `${this.apiUrl}/my`;
    return this.http.get<AppointmentsApiResponse>(requestUrl, { params })
      .pipe(
        map(response => response.appointments || []),
        catchError(this.handleError)
      );
  }

  /**
   * Allows a patient to cancel their own upcoming appointment.
   */
  cancelPatientAppointment(appointmentId: string): Observable<any> {
    const requestUrl = `${this.apiUrl}/my/${appointmentId}`;
    return this.http.delete<any>(requestUrl)
      .pipe(
        tap(response => console.log('Cancellation response:', response)),
        catchError(this.handleError)
      );
  }

  /**
   * Books a new appointment for the authenticated patient.
   * @param appointmentData - Data needed to book the appointment.
   */
bookAppointment(appointmentData: BookAppointmentData): Observable<BookAppointmentResponse> { // Return full response
  const requestUrl = `${this.apiUrl}`;
  return this.http.post<BookAppointmentResponse>(requestUrl, appointmentData)
    .pipe(
      tap(response => console.log('Appointment booked successfully:', response)),
      catchError(this.handleError)
    );
}

  // /**
  //  * (Future) Allows a patient to update/reschedule their own appointment.
  //  * @param appointmentId The ID of the appointment to update.
  //  * @param updateData The data to update.
  //  */
  // // updateMyAppointment(appointmentId: string, updateData: Partial<BookAppointmentData>): Observable<Appointment> {
  // //   const requestUrl = `${this.apiUrl}/my/${appointmentId}`; // Backend: PUT /api/appointments/my/:appointmentId
  // //   return this.http.put<Appointment>(requestUrl, updateData)
  // //     .pipe(
  // //       tap(updatedAppointment => console.log('Appointment updated by patient:', updatedAppointment)),
  // //       catchError(this.handleError)
  // //     );
  // // }


  // Helper to get public doctor details (might move to a DoctorService later)
  getPublicDoctorProfile(doctorId: string): Observable<Doctor> {
      const requestUrl = `${environment.apiBaseUrl}/public/doctors/${doctorId}`;
      return this.http.get<{doctor: Doctor}>(requestUrl).pipe(map(res => res.doctor), catchError(this.handleError));
  }

  // Helper to get available slots (might move to a DoctorService later)
  getDoctorAvailableSlots(doctorId: string, date: string): Observable<string[]> {
      const requestUrl = `${environment.apiBaseUrl}/doctors/${doctorId}/available-slots`;
      let params = new HttpParams().set('date', date);
      return this.http.get<{availableSlots: string[]}>(requestUrl, { params }).pipe(map(res => res.availableSlots), catchError(this.handleError));
  }

/**
   * Gets the current authenticated doctor's appointments.
   * Allows filtering by status, date, and sorting.
   * @param status Optional status to filter by (e.g., 'Scheduled', 'Confirmed')
   * @param date Optional date string (YYYY-MM-DD) to filter by
   * @param sort Optional sort order (e.g., 'time_asc')
   * @param limit Optional limit for the number of appointments
   */
  getMyAppointmentsAsDoctor(
  status?: string,
  date?: string,
  sort?: string,
  page?: number,
  limit?: number
): Observable<AppointmentsApiResponse> { // <<< RETURN TYPE IS AppointmentsApiResponse
  let params = new HttpParams();
  if (status) params = params.append('status', status);
  if (date) params = params.append('date', date);
  if (sort) params = params.append('sort', sort);
  if (page !== undefined) params = params.append('page', page.toString());
  if (limit !== undefined) params = params.append('limit', limit.toString());

  const requestUrl = `${this.apiUrl}/doctor/my`;
  console.log(`Requesting doctor appointments from: ${requestUrl} with params:`, params.toString());

  return this.http.get<AppointmentsApiResponse>(requestUrl, { params })
    .pipe(
      // REMOVE any .map(response => response.appointments || []) that might have been here.
      // We want to return the full AppointmentsApiResponse object.
      tap(response => console.log('Full response from getMyAppointmentsAsDoctor:', response)), // For debugging
      catchError(this.handleError)
    );
}

/**
   * Allows a doctor to update the status of one of their appointments.
   * @param appointmentId The ID of the appointment to update.
   * @param statusData The new status and optional notes.
   */
  updateAppointmentStatusByDoctor(appointmentId: string, statusData: UpdateAppointmentStatusData): Observable<Appointment> {
    const requestUrl = `${this.apiUrl}/doctor/${appointmentId}/status`; // Backend: PUT /api/appointments/doctor/:appointmentId/status
    console.log(`Updating appointment status: ${requestUrl}`, statusData);
    return this.http.put<Appointment>(requestUrl, statusData) // Expecting the updated Appointment back
      .pipe(
        tap(updatedAppointment => console.log('Appointment status updated by doctor:', updatedAppointment)),
        catchError(this.handleError)
      );
  }




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
    console.error("AppointmentService Error:", errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}