import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // Adjust path if needed
import { LoginCredentials } from '../../../shared/models/auth.model'; // Adjust path if needed
import { User } from '../../../shared/models/user.model'; // Adjust path if needed


@Component({
  selector: 'app-admin-login',
  standalone: false,
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // ... (existing ngOnInit logic to redirect if already logged in) ...

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

    // --- DETAILED LOGGING ---
    const rawEmail = this.f['email'].value;
    const rawPassword = this.f['password'].value;

    console.log(`Admin Login - Raw Email from form: "[${rawEmail}]"`); // Brackets to show spaces
    console.log(`Admin Login - Raw Password from form: "[${rawPassword}]"`);

    const credentials: LoginCredentials = {
      email: rawEmail.trim(), // Trim email just in case
      password: rawPassword   // Do NOT trim password by default unless you are certain
                               // your seeded password has no leading/trailing spaces AND
                               // users will never intentionally use them.
                               // For testing, if DefaultAdminPassword123! has no spaces, this is fine.
    };

    console.log('Admin Login - Credentials being sent to service:', JSON.stringify(credentials));
    // --- END DETAILED LOGGING ---

    this.authService.login(credentials, 'admin').subscribe({
      next: (user: User) => {
        this.isSubmitting = false;
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.loginError = 'Login successful, but role is not Admin.';
          this.authService.logout();
        }
      },
      error: (error) => {
        console.error('Admin login failed in component:', error);
        this.loginError = error.message || 'Login failed. Please check your credentials.';
        this.isSubmitting = false;
      }
    });
  }
}