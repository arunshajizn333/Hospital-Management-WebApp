// src/app/modules/patient/services/patient.service.ts
// src/app/modules/patient/services/patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Patient } from '../../../shared/models/patient.model';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model'; // Import User

@Injectable({
  providedIn: 'root' // Provide at root to ensure singleton, or provide in PatientModule
})
export class PatientService {
   private apiUrl = `${environment.apiBaseUrl}/patients`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

 getMyProfile(): Observable<Patient> {
    const requestUrl = `${this.apiUrl}/me/profile`; // This backend route needs token
    console.log(`Requesting patient profile from: ${requestUrl}`);
    // No need to manually add headers here, interceptor will do it
    return this.http.get<Patient>(requestUrl)
      .pipe(catchError(this.handleError));
  }

  updateMyProfile(profileData: Partial<Patient>): Observable<any> {
    const requestUrl = `${this.apiUrl}/me/profile`;
    return this.http.put<any>(requestUrl, profileData).pipe(
      tap((response: any) => {
        const currentUser = this.authService.currentUserValue; // Get current user for merging
        if (response && response.patient && currentUser) {
          // Merge existing currentUser with new patient data, ensuring all User fields are present
          const updatedUser: User = {
            ...currentUser, // Spread existing user data
            ...response.patient, // Override with new patient data
            role: 'patient' // Ensure role is correctly set if it's not in response.patient
          };
          this.authService.updateCurrentUser(updatedUser); // Use public method
          console.log('Patient profile updated and AuthService refreshed via response.patient.');
        } else if (response && response.message && currentUser) {
            // If only a message is returned, merge submitted profileData with currentUser
            const mergedData: User = {
                ...currentUser,
                ...profileData, // Spread the data that was sent for update
                // Ensure _id, email, role are preserved from currentUser if not in profileData
                _id: currentUser._id,
                email: currentUser.email,
                role: 'patient'
            };
            this.authService.updateCurrentUser(mergedData); // Use public method
            console.log('Patient profile updated (message only), AuthService refreshed via submitted data.');
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // ... (your existing handleError logic) ...
    let errorMessage = 'An unknown error occurred with a patient data operation!';
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
    console.error("PatientService Error:", errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}