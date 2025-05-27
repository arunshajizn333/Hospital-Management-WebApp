import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'; // Import AbstractControl
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // Adjust path based on actual location
import { ChangePasswordData } from '../../models/auth.model'; // Assuming this interface exists or create it

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  currentUserRole: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUserRole = this.authService.currentUserValue?.role || null;

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validator to check if newPassword and confirmNewPassword match
  passwordMatchValidator(group: AbstractControl): { [s: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword ? null : { 'passwordsNotMatching': true };
  }

  get f() { return this.changePasswordForm.controls; }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const passwordData: ChangePasswordData = {
      currentPassword: this.f['currentPassword'].value,
      newPassword: this.f['newPassword'].value
      // confirmNewPassword is only for frontend validation, not usually sent to backend
    };

    this.authService.changePassword(passwordData).subscribe({
      next: (response: any) => { // Backend might return a simple message object
        this.isSubmitting = false;
        this.successMessage = response?.message || 'Password changed successfully! Please log in again if prompted.';
        this.changePasswordForm.reset();
        // Consider logging out the user for security after password change
        // this.authService.logout();
        // this.router.navigate(['/login']); // Or a role-specific login
        setTimeout(() => {
          this.successMessage = null;
          // Optionally navigate away or prompt re-login
          if (this.currentUserRole) {
            this.router.navigate([`/${this.currentUserRole}/dashboard`]); // Go back to their dashboard
          } else {
            this.router.navigate(['/']); // Fallback
          }
        }, 3000);
      },
      error: (err: Error) => {
        console.error('Error changing password:', err);
        this.errorMessage = err.message || 'Failed to change password. Please ensure your current password is correct.';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    // Navigate back to the user's profile or dashboard
    if (this.currentUserRole) {
      this.router.navigate([`/${this.currentUserRole}/profile`]); // Example: back to profile
    } else {
      this.router.navigate(['/']); // Fallback
    }
  }
}