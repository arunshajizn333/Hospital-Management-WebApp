import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // Adjust path if needed
import { LoginCredentials } from '../../../shared/models/auth.model'; // Adjust path if needed
import { User } from '../../../shared/models/user.model'; // Adjust path if needed



@Component({
  selector: 'app-doctor-login',
  standalone: false,
  templateUrl: './doctor-login.component.html',
  styleUrl: './doctor-login.component.css'
})
export class DoctorLoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

   ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) { // If any user is logged in
      if (currentUser.role === 'doctor') {
        // If it's a doctor, send them to their dashboard
        this.router.navigate(['/doctor/dashboard']);
      } else {
        // If it's another role (patient, admin), they shouldn't be on doctor login.
        // Redirect them to their respective dashboard or a general page like home.
        console.log(`User with role '${currentUser.role}' attempted to access doctor login. Redirecting.`);
        // Example: Redirect to home. You can make this smarter if needed.
        this.router.navigate(['/doctor-login']);
      }
    }
    // If no one is logged in, proceed to set up the login form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.loginError = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const credentials: LoginCredentials = this.loginForm.value;

    this.authService.login(credentials, 'doctor').subscribe({
      next: (user: User) => {
        this.isSubmitting = false;
        if (user.role === 'doctor') {
          this.router.navigate(['/doctor/dashboard']); // Or your doctor dashboard route
        } else {
          // Should not happen if backend assigns roles correctly for doctor login endpoint
          this.loginError = 'Login successful, but role is not recognized as Doctor.';
          this.authService.logout(); // Log out the incorrectly assigned user
        }
      },
      error: (error) => {
        console.error('Doctor login failed:', error);
        this.loginError = error.message || 'Login failed. Please check your credentials.';
        this.isSubmitting = false;
      }
    });
  }
}