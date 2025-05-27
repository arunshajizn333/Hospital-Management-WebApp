import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path
import { User } from '../../../../shared/models/user.model'; // Adjust path
import { Router } from '@angular/router'

@Component({
  selector: 'app-admin-dashboard-layout',
  standalone: false,
  templateUrl: './admin-dashboard-layout.component.html',
  styleUrl: './admin-dashboard-layout.component.css'
})
export class AdminDashboardLayoutComponent {
  currentAdmin: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentAdmin = this.authService.currentUserValue;
  }

  logout(): void {
    this.authService.logout();
    // AuthService logout method navigates to home or login
  }

}
