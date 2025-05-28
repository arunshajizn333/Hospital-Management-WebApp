// src/app/modules/admin/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Department, DepartmentsApiResponse } from '../../../shared/models/department.model';
import { Doctor, DoctorsApiResponse, AdminDoctorPayload } from '../../../shared/models/doctor.model';
import { HospitalInfo } from '../../../shared/models/hospital-info.model'; // Assuming this is the type for hospitalInfo
import { CallbackRequest, CallbackRequestsApiResponse } from '../../../shared/models/callback-request.model'; // Assuming these types
import { ContactInquiry, ContactInquiriesApiResponse } from '../../../shared/models/contact-inquiry.model'; // Assuming these types
import { PatientSummaryAnalytics, DoctorAppointmentSummaryAnalytics } from '../../../shared/models/analytics.model'; // Create this model file
import { Patient, PatientsApiResponse } from '../../../shared/models/patient.model';
import { Appointment, AppointmentsApiResponse } from '../../../shared/models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminApiUrl = `${environment.apiBaseUrl}/admin`;
  private appointmentsApiUrl = `${environment.apiBaseUrl}/appointments`; // Base for general appointment routes
  constructor(private http: HttpClient) { }

  // --- Department Management ---
  getDepartments(page?: number, limit?: number, name?: string): Observable<DepartmentsApiResponse> {
    let params = new HttpParams();
    if (page !== undefined) params = params.append('page', page.toString());
    if (limit !== undefined) params = params.append('limit', limit.toString());
    if (name) params = params.append('name', name);
    const requestUrl = `${this.adminApiUrl}/departments`;
    return this.http.get<DepartmentsApiResponse>(requestUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getDepartmentById(id: string): Observable<Department> {
    const requestUrl = `${this.adminApiUrl}/departments/${id}`;
    return this.http.get<{ department: Department }>(requestUrl).pipe(
      map(response => response.department),
      catchError(this.handleError)
    );
  }

  createDepartment(departmentData: Partial<Department>): Observable<Department> {
    const requestUrl = `${this.adminApiUrl}/departments`;
    return this.http.post<{ message: string, department: Department }>(requestUrl, departmentData).pipe(
      map(response => response.department),
      catchError(this.handleError)
    );
  }

  updateDepartment(id: string, departmentData: Partial<Department>): Observable<Department> {
    const requestUrl = `${this.adminApiUrl}/departments/${id}`;
    return this.http.put<{ message: string, department: Department }>(requestUrl, departmentData).pipe(
      map(response => response.department),
      catchError(this.handleError)
    );
  }

  deleteDepartment(id: string): Observable<any> {
    const requestUrl = `${this.adminApiUrl}/departments/${id}`;
    return this.http.delete<any>(requestUrl).pipe(
      catchError(this.handleError)
    );
  }

  // --- Hospital Info ---
  updateHospitalInfo(hospitalInfoData: Partial<HospitalInfo>): Observable<HospitalInfo> {
    const requestUrl = `${this.adminApiUrl}/hospital-info`;
    // Assuming backend returns { message: string, hospitalInfo: HospitalInfo }
    return this.http.put<{ message: string, hospitalInfo: HospitalInfo }>(requestUrl, hospitalInfoData).pipe(
      map(response => response.hospitalInfo),
      catchError(this.handleError)
    );
  }

  // --- Callback & Contact Inquiries ---
  getCallbackRequests(page?: number, limit?: number, status?: string): Observable<CallbackRequestsApiResponse> {
    let params = new HttpParams();
    if (page !== undefined) params = params.append('page', page.toString());
    if (limit !== undefined) params = params.append('limit', limit.toString());
    if (status) params = params.append('status', status);
    const requestUrl = `${this.adminApiUrl}/callbacks`;
    return this.http.get<CallbackRequestsApiResponse>(requestUrl, { params })
      .pipe(catchError(this.handleError));
  }

  updateCallbackRequestStatus(id: string, data: { status: string, staffNotes?: string }): Observable<CallbackRequest> {
    const requestUrl = `${this.adminApiUrl}/callbacks/${id}/status`;
    // Assuming backend returns the updated CallbackRequest object
    return this.http.put<CallbackRequest>(requestUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  getContactInquiries(page?: number, limit?: number, status?: string): Observable<ContactInquiriesApiResponse> {
    let params = new HttpParams();
    if (page !== undefined) params = params.append('page', page.toString());
    if (limit !== undefined) params = params.append('limit', limit.toString());
    if (status) params = params.append('status', status);
    const requestUrl = `${this.adminApiUrl}/contact-inquiries`;
    return this.http.get<ContactInquiriesApiResponse>(requestUrl, { params })
      .pipe(catchError(this.handleError));
  }

  updateContactInquiryStatus(id: string, data: { status: string, staffNotes?: string }): Observable<ContactInquiry> {
    const requestUrl = `${this.adminApiUrl}/contact-inquiries/${id}/status`;
    // Assuming backend returns the updated ContactInquiry object
    return this.http.put<ContactInquiry>(requestUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  // --- Analytics ---
  getPatientSummary(): Observable<PatientSummaryAnalytics> { // Use specific type
    const requestUrl = `${this.adminApiUrl}/analytics/patient-summary`;
    return this.http.get<PatientSummaryAnalytics>(requestUrl)
      .pipe(catchError(this.handleError));
  }

  getDoctorAppointmentSummary(): Observable<DoctorAppointmentSummaryAnalytics> { // Use specific type
    const requestUrl = `${this.adminApiUrl}/analytics/doctor-appointment-summary`;
    return this.http.get<DoctorAppointmentSummaryAnalytics>(requestUrl)
      .pipe(catchError(this.handleError));
  }

  // --- Doctor Management by Admin --- (Copied from previous corrected version)
  createDoctor(doctorData: AdminDoctorPayload): Observable<Doctor> {
    const requestUrl = `${this.adminApiUrl}/doctors`;
    return this.http.post<{message: string, doctor: Doctor}>(requestUrl, doctorData)
      .pipe(map(res => res.doctor), catchError(this.handleError));
  }

  getDoctors(page?: number, limit?: number, name?: string, specialization?: string, departmentId?: string): Observable<DoctorsApiResponse> {
    let params = new HttpParams();
    if (page !== undefined) params = params.append('page', page.toString());
    if (limit !== undefined) params = params.append('limit', limit.toString());
    if (name) params = params.append('name', name);
    if (specialization) params = params.append('specialization', specialization);
    if (departmentId) params = params.append('departmentId', departmentId);
    
    const requestUrl = `${this.adminApiUrl}/doctors`;
    return this.http.get<DoctorsApiResponse>(requestUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getDoctorById(id: string): Observable<Doctor> {
    const requestUrl = `${this.adminApiUrl}/doctors/${id}`;
    return this.http.get<{doctor: Doctor}>(requestUrl)
      .pipe(map(res => res.doctor), catchError(this.handleError));
  }

  updateDoctor(id: string, doctorData: Partial<AdminDoctorPayload>): Observable<Doctor> {
    const requestUrl = `${this.adminApiUrl}/doctors/${id}`;
    // Ensure backend returns { message: string, doctor: Doctor } for this map to work
    return this.http.put<{message: string, doctor: Doctor}>(requestUrl, doctorData)
      .pipe(
        map(res => res.doctor), // This expects the backend to return an object with a 'doctor' property
        catchError(this.handleError)
      );
  }
  deleteDoctor(id: string): Observable<any> {
    const requestUrl = `${this.adminApiUrl}/doctors/${id}`;
    return this.http.delete<any>(requestUrl)
      .pipe(catchError(this.handleError));
  }
  // --- End Doctor Management ---

  // --- NEW: Patient Management by Admin ---
  /**
   * Gets a paginated and optionally filtered list of all patients for admin.
   */
  getAllPatients(
    filters?: { name?: string; email?: string; status?: string },
    page?: number,
    limit?: number
  ): Observable<PatientsApiResponse> {
    let params = new HttpParams();
    if (page !== undefined) params = params.append('page', page.toString());
    if (limit !== undefined) params = params.append('limit', limit.toString());
    if (filters?.name) params = params.append('name', filters.name);
    if (filters?.email) params = params.append('email', filters.email);
    if (filters?.status) params = params.append('status', filters.status);

    const requestUrl = `${this.adminApiUrl}/patients`;
    console.log(`Requesting all patients for admin from: ${requestUrl} with params:`, params.toString());
    return this.http.get<PatientsApiResponse>(requestUrl, { params })
      .pipe(catchError(this.handleError));
  }

   // --- NEW: System-Wide Appointment Management by Admin ---

  /**
   * Gets a paginated and filtered list of ALL appointments in the system for admin.
   */
  getAllSystemAppointments(
    filters?: { doctorId?: string; patientId?: string; status?: string; dateFrom?: string; dateTo?: string },
    page?: number,
    limit?: number,
    sort?: string
  ): Observable<AppointmentsApiResponse> {
    let params = new HttpParams();
    if (page !== undefined) params = params.append('page', page.toString());
    if (limit !== undefined) params = params.append('limit', limit.toString());
    if (filters?.doctorId) params = params.append('doctorId', filters.doctorId);
    if (filters?.patientId) params = params.append('patientId', filters.patientId);
    if (filters?.status) params = params.append('status', filters.status);
    if (filters?.dateFrom) params = params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.append('dateTo', filters.dateTo);
    if (sort) params = params.append('sort', sort);

    // Backend route is GET /api/appointments/admin/all
    const requestUrl = `${this.appointmentsApiUrl}/admin/all`;
    console.log(`Requesting all system appointments for admin from: ${requestUrl} with params:`, params.toString());
    return this.http.get<AppointmentsApiResponse>(requestUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Admin updates any appointment in the system.
   * @param appointmentId The ID of the appointment to update.
   * @param updateData The data to update (can be partial).
   */
  manageAppointmentByAdmin(appointmentId: string, updateData: Partial<Appointment>): Observable<Appointment> {
    // Backend route is PUT /api/appointments/admin/:appointmentId/manage
    const requestUrl = `${this.appointmentsApiUrl}/admin/${appointmentId}/manage`;
    console.log(`Admin managing appointment ${appointmentId} at: ${requestUrl}`, updateData);
    // Assuming backend returns the updated Appointment object
    return this.http.put<Appointment>(requestUrl, updateData)
      .pipe(
        tap(updatedAppointment => console.log('Appointment updated by admin:', updatedAppointment)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred in AdminService!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Could not connect to the server. Please check your network.';
      } else if (error.error && error.error.message) {
        errorMessage = `${error.error.message}`;
      } else {
        errorMessage = `Server error: ${error.status} - ${error.statusText || 'Unknown server error'}`;
      }
    }
    console.error("AdminService Error:", errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
  
}