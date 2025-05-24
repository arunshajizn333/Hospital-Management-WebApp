import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-dashboard-layout',
  standalone: false,
  templateUrl: './doctor-dashboard-layout.component.html',
  styleUrl: './doctor-dashboard-layout.component.css'
})
export class DoctorDashboardLayoutComponent {
constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    // AuthService logout method navigates to home or login
  }
}
