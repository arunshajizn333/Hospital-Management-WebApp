import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path as needed
import { Router } from '@angular/router';
@Component({
  selector: 'app-patient-dashboard-layout',
  standalone: false,
  templateUrl: './patient-dashboard-layout.component.html',
  styleUrl: './patient-dashboard-layout.component.css'
})
export class PatientDashboardLayoutComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    // AuthService logout method should already navigate to login or home.
    // If not, you can add: this.router.navigate(['/']);
  }
}