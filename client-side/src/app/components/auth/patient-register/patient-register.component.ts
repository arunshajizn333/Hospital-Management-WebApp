import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'; // Import AbstractControl
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalManagerService } from '../../../core/services/modal-manager.service';
import { PatientRegistrationData } from '../../../shared/models/auth.model'; // Assuming you have this
import { User } from '../../../shared/models/user.model';


@Component({
  selector: 'app-patient-register',
  standalone: false,
  templateUrl: './patient-register.component.html',
  styleUrl: './patient-register.component.css'
})
export class PatientRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;
  submitSuccessMessage: string | null = null;
  submitErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private modalManagerService: ModalManagerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', [Validators.required]],
      // Add other optional fields from PatientRegistrationData if you want them in the form
      // dateOfBirth: [''],
      // gender: [''],
      // phoneNumber: [''] // Example, if contact is just a phone number
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validator to check if password and confirmPassword match
  passwordMatchValidator(group: AbstractControl): { [s: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  // Getter for easy access to form controls in the template
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitSuccessMessage = null;
    this.submitErrorMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    // Exclude confirmPassword from the data sent to backend
    const { confirmPassword, ...registrationData } = this.registerForm.value;
    const formData = registrationData as PatientRegistrationData; // Cast to your defined interface

    this.authService.registerPatient(formData).subscribe({
      next: (user: User) => { // Expecting User object due to auto-login
        this.isSubmitting = false;
        this.registerForm.reset();
        this.modalManagerService.closeRegisterModal();
        // Navigate to patient dashboard after successful auto-login
        this.navigateToDashboard(user.role);
        // Optionally show a brief success message/toast before navigation
        // this.submitSuccessMessage = 'Registration successful! Welcome.';
        // setTimeout(() => this.navigateToDashboard(user.role), 1500);
      },
      error: (error) => {
        console.error('Patient registration failed:', error);
        this.submitErrorMessage = error.message || 'Registration failed. Please try again or contact support if the issue persists.';
        this.isSubmitting = false;
      }
    });
  }

  private navigateToDashboard(role: 'patient' | 'doctor' | 'admin'): void {
    // This function can remain generic, but will only be called with 'patient' from this component
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']); // Define admin dashboard route later
        break;
      case 'doctor':
        this.router.navigate(['/doctor']); // Define doctor dashboard route later
        break;
      case 'patient':
        this.router.navigate(['/patient']); // Define patient dashboard route later
        break;
      default:
        this.router.navigate(['/']); // Fallback to home
        break;
    }
  }
  // Add to PatientRegisterComponent.ts
switchToLogin(): void {
  this.modalManagerService.closeRegisterModal();
  this.modalManagerService.openLoginModal();
}
}