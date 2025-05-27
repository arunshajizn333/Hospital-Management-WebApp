// src/app/services/public-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Department, DepartmentsApiResponse } from '../../shared/models/department.model';
import { Doctor, DoctorsApiResponse } from '../../shared/models/doctor.model';
import { environment } from '../../environments/environment';
import { HospitalInfo, HospitalInfoApiResponse } from '../../shared/models/hospital-info.model';
import { CallbackRequestData, CallbackResponse } from '../../shared/models/callback-request.model';
import { ContactInquiryData, ContactInquiryResponse } from '../../shared/models/contact-inquiry.model';


@Injectable({
  providedIn: 'root'
})
export class PublicDataService {
  private baseApiUrl = environment.apiBaseUrl; // e.g., http://localhost:5000/api
  private publicApiSegment = '/public';

  constructor(private http: HttpClient) { }

  getDepartments(): Observable<Department[]> {
    const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}`;
    console.log('Requesting departments from URL:', fullUrl);
    return this.http.get<DepartmentsApiResponse>(fullUrl)
      .pipe(map(response => response.departments || []));
  }

  getFeaturedDoctors(limit: number = 3): Observable<Doctor[]> {
    const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/doctors/featured?limit=${limit}`;
    console.log('Requesting featured doctors from URL:', fullUrl);
    return this.http.get<DoctorsApiResponse>(fullUrl)
      .pipe(map(response => response.doctors || []));
  }

  getHospitalInfo(): Observable<HospitalInfo> {
    const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/hospital-info`;
    console.log('Requesting hospital info from URL:', fullUrl);
    return this.http.get<HospitalInfoApiResponse>(fullUrl)
      .pipe(map(response => response.hospitalInfo));
  }

  submitCallbackRequest(callbackData: CallbackRequestData): Observable<CallbackResponse> {
    const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/callbacks`;
    console.log('Submitting callback request to URL:', fullUrl, callbackData);
    return this.http.post<CallbackResponse>(fullUrl, callbackData)
      .pipe(catchError(this.handleError));
  }

  // THIS IS THE METHOD IN QUESTION - ENSURE IT'S CORRECT
  getPublicDoctorsList(filters: { name?: string, specialization?: string, departmentId?: string } = {}, page: number = 1, limit: number = 100): Observable<Doctor[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.name) params = params.append('name', filters.name);
    if (filters.specialization) params = params.append('specialization', filters.specialization);
    if (filters.departmentId) params = params.append('departmentId', filters.departmentId);

    // --- ENSURE THIS LINE IS CORRECT WITH BACKTICKS ---
    const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/doctors`; 
    // --- ---

    console.log('Requesting public doctors list from URL:', fullUrl, 'with params:', params.toString());
    return this.http.get<DoctorsApiResponse>(fullUrl, { params })
      .pipe(
        map(response => response.doctors || []
        ),
        catchError(this.handleError)
      );
  }

  submitContactInquiry(inquiryData: ContactInquiryData): Observable<ContactInquiryResponse> {
     const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/contact-inquiries`; // Corrected this from /callbacks
     console.log('Submitting contact inquiry to URL:', fullUrl, inquiryData);
     return this.http.post<ContactInquiryResponse>(fullUrl, inquiryData)
       .pipe(catchError(this.handleError));
   }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Could not connect to the server. Please check your network connection.';
      } else if (error.error && error.error.message) {
        errorMessage = `Server error: ${error.status} - ${error.error.message}`;
      } else {
        errorMessage = `Server error: ${error.status} - ${error.statusText}`;
      }
    }
    console.error("PublicDataService Error:", errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}