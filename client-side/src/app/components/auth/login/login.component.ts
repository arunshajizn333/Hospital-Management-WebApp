// src/app/components/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalManagerService } from '../../../core/services/modal-manager.service';
import { LoginCredentials } from '../../../shared/models/auth.model';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private modalManagerService: ModalManagerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // No auto-redirect from ngOnInit here as this component is now modal content.
    // The decision to show/hide the modal should be handled by the parent or ModalManagerService
    // based on the global authentication state if needed (e.g., don't show login button if already logged in).

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
      // Role is hardcoded to 'patient' for this component
    });
  }

  // Getter for easy access to form controls in the template
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.loginError = null; // Reset error message
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Show validation errors
      return;
    }

    this.isSubmitting = true;
    const credentials: LoginCredentials = this.loginForm.value;
    const roleToLogin: 'patient' = 'patient'; // Explicitly patient for this component

    this.authService.login(credentials, roleToLogin).subscribe({
      next: (user: User) => {
        this.isSubmitting = false;
        this.loginForm.reset();
        
        this.modalManagerService.closeLoginModal(); // Close the modal on successful login
       this.router.navigate(['/patient']); // Navigate to the patient dashboard
      },
      error: (error) => {
        console.error('Patient login failed:', error);
        this.loginError = error.message || 'Login failed. Please check your credentials.';
        this.isSubmitting = false;
      }
    });
  }

  private navigateToDashboard(role: 'patient' | 'doctor' | 'admin'): void {
    // This component will only ever call this with role 'patient'
    // But the function can remain generic for potential reuse if needed
    if (role === 'patient') {
      this.router.navigate(['/patient/dashboard']); // Or just '/patient' if that's your base
    } else {
      // Fallback or error if an unexpected role comes through for patient login
      console.warn('Unexpected role after patient login:', role);
      this.router.navigate(['/']); // Go to home as a fallback
    }
  }

  // If user wants to switch to registration modal from login modal
  switchToRegister(): void {
    this.modalManagerService.closeLoginModal();
    this.modalManagerService.openRegisterModal();
  }
}