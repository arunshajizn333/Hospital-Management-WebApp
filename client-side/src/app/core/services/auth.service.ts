// src/app/core/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // Import Inject and PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { User } from '../../shared/models/user.model';
import { LoginCredentials, AuthResponse, PatientRegistrationData } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiUrl = `${environment.apiBaseUrl}/auth`;

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated: Observable<boolean>;

  private isBrowser: boolean; // Flag to store if running in browser

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object // Inject PLATFORM_ID
  ) {
    this.isBrowser = isPlatformBrowser(platformId); // Check if platform is browser

    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!storedUser);
    this.isAuthenticated = this.isAuthenticatedSubject.asObservable();
  }

  private getUserFromStorage(): User | null {
    if (this.isBrowser) { // Only access localStorage if in browser
      const userJson = localStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    }
    return null; // Return null if not in browser
  }

  public getToken(): string | null {
    if (this.isBrowser) { // Only access localStorage if in browser
      return localStorage.getItem('authToken');
    }
    return null; // Return null if not in browser
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginCredentials, role: 'patient' | 'doctor' | 'admin'): Observable<User> {
    const loginUrl = `${this.authApiUrl}/${role}/login`;
    console.log(`Attempting login to: ${loginUrl} for role: ${role}`);

    return this.http.post<AuthResponse>(loginUrl, credentials).pipe(
      tap(response => {
        if (response && response.token && response.user) {
          if (this.isBrowser) { // Only interact with localStorage and update subjects if in browser
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
          console.log(`${response.user.role || role} login successful. User data:`, response.user);
        } else {
          throw new Error('Login response did not contain token or user data.');
        }
      }),
      map(response => response.user),
      catchError(this.handleError)
    );
  }

  registerPatient(patientData: PatientRegistrationData): Observable<User> {
    const registerUrl = `${this.authApiUrl}/patient/register`;
    console.log(`Attempting patient registration to: ${registerUrl}`);
    return this.http.post<AuthResponse>(registerUrl, patientData).pipe(
      tap(response => {
        if (response && response.token && response.user) {
          if (this.isBrowser) { // Only interact with localStorage and update subjects if in browser
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
          console.log('Patient registration successful and auto-logged in:', response.user);
        } else {
          console.warn('Patient registration successful, but no token/user in response for auto-login.', response);
          throw new Error('Registration response missing token or user data for auto-login.');
        }
      }),
      map(response => response.user),
      catchError(this.handleError)
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    // These should be safe to call always, as they just update in-memory state.
    // The initial state on the server will be 'logged out' anyway.
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
    console.log('User logged out.');
  }

  changePassword(passwordData: any): Observable<any> {
    const changePasswordUrl = `${this.authApiUrl}/change-password`;
    return this.http.put(changePasswordUrl, passwordData).pipe(
        catchError(this.handleError)
    );
  }

  // --- NEW PUBLIC METHOD TO UPDATE CURRENT USER ---
  public updateCurrentUser(user: User | null): void {
    if (this.isBrowser && user) { // Also update localStorage if user is not null
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else if (this.isBrowser && !user) { // If user is null (e.g. after an error causing logout)
        localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user); // Update auth state based on user presence
  }

  private handleError(error: HttpErrorResponse) {
    // ... (your existing handleError logic)
    let errorMessage = 'An unknown error occurred!';
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