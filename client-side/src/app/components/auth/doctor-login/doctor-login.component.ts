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
    if (currentUser) {
      if (currentUser.role === 'doctor') {
        this.router.navigate(['/doctor']); // Or your actual doctor dashboard route
      } else {
        this.router.navigate(['/']); // Redirect other logged-in users to home
      }
    }

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
          this.router.navigate(['/doctor/dashboard']); // Navigate to doctor dashboard
        } else {
          this.loginError = 'Login successful, but role is not Doctor.';
          this.authService.logout(); // Log out if role mismatch
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