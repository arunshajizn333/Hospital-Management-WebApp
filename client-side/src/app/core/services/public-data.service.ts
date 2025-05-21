// src/app/services/public-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Department, DepartmentsApiResponse } from '../../shared/models/department.model'; // Ensure path is correct
import { Doctor, DoctorsApiResponse } from '../../shared/models/doctor.model';     // Ensure path is correct
import { environment } from '../../environments/environment';
import { HospitalInfo, HospitalInfoApiResponse } from '../../shared/models/hospital-info.model';
import { CallbackRequestData, CallbackResponse } from '../../shared/models/callback-request.model';
import { ContactInquiryData, ContactInquiryResponse } from '../../shared/models/contact-inquiry.model';

@Injectable({
  providedIn: 'root'
})
export class PublicDataService {
  private baseApiUrl = environment.apiBaseUrl; // e.g., http://localhost:5000/api
  private publicApiSegment = '/public';       // Segment for public routes

  constructor(private http: HttpClient) { }

  getDepartments(): Observable<Department[]> {
    const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/departments`;
    console.log('Requesting departments from URL:', fullUrl);
    return this.http.get<DepartmentsApiResponse>(fullUrl)
      .pipe(
        map(response => response.departments)
      );
  }

  getFeaturedDoctors(limit: number = 5): Observable<Doctor[]> {
    const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/doctors/featured?limit=${limit}`;
    console.log('Requesting featured doctors from URL:', fullUrl);
    return this.http.get<DoctorsApiResponse>(fullUrl)
      .pipe(
        map(response => response.doctors)
      );
  }

 
   getHospitalInfo(): Observable<HospitalInfo> {
    const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/hospital-info`; // USE BACKTICKS HERE
    console.log('Requesting hospital info from URL (after correction attempt):', fullUrl); // Added a marker
    return this.http.get<HospitalInfoApiResponse>(fullUrl)
      .pipe(
        map(response => response.hospitalInfo)
      );
  }

  submitCallbackRequest(callbackData: CallbackRequestData): Observable<CallbackResponse> {
    const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/callbacks`;
    console.log('Submitting callback request to URL:', fullUrl, callbackData);
    return this.http.post<CallbackResponse>(fullUrl, callbackData)
      .pipe(
        catchError(this.handleError) // Add error handling
      );
  }

  // Basic error handler (can be expanded or moved to a separate error handling service)
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      if (error.status === 0) {
        errorMessage = 'Could not connect to the server. Please check your network connection.';
      } else if (error.error && error.error.message) {
        errorMessage = `Server error: ${error.status} - ${error.error.message}`;
      } else {
        errorMessage = `Server error: ${error.status} - ${error.statusText}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage)); // Return an observable error
  }

    submitContactInquiry(inquiryData: ContactInquiryData): Observable<ContactInquiryResponse> {
     const fullUrl = `${this.baseApiUrl}${this.publicApiSegment}/callbacks`;    console.log('Submitting contact inquiry to URL:', fullUrl, inquiryData);
    return this.http.post<ContactInquiryResponse>(fullUrl, inquiryData)
      .pipe(
        catchError(this.handleError) // Re-use the same error handler
      );
  }

  
  // We will add methods here later for getPublicDoctorsList, getPublicDoctorProfile etc.
}