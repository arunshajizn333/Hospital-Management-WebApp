import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service'; // Adjust path
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path
import { User } from '../../../../shared/models/user.model'; // Adjust path
// Import interfaces for analytics data from your analytics.model.ts
import { PatientSummaryAnalytics, DoctorAppointmentSummaryAnalytics, DoctorSummary } from '../../../../shared/models/analytics.model'; // Adjust path

@Component({
  selector: 'app-admin-dashboard-home',
  standalone: false,
  templateUrl: './admin-dashboard-home.component.html',
  styleUrl: './admin-dashboard-home.component.css'
})
export class AdminDashboardHomeComponent implements OnInit {
  currentAdmin: User | null = null;

  patientSummary: PatientSummaryAnalytics['summary'] | null = null; // Store only the summary object
  isLoadingPatientSummary = true;
  patientSummaryError: string | null = null;

  doctorAppointmentSummary: DoctorSummary[] = []; // Store the array of doctor summaries
  isLoadingDoctorSummary = true;
  doctorSummaryError: string | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentAdmin = this.authService.currentUserValue;
    this.loadPatientSummary();
    this.loadDoctorAppointmentSummary();
  }

  loadPatientSummary(): void {
    this.isLoadingPatientSummary = true;
    this.patientSummaryError = null;
    this.adminService.getPatientSummary().subscribe({
      next: (response: PatientSummaryAnalytics) => {
        this.patientSummary = response.summary;
        this.isLoadingPatientSummary = false;
      },
      error: (err: Error) => {
        console.error('Error fetching patient summary:', err);
        this.patientSummaryError = err.message || 'Could not load patient summary.';
        this.isLoadingPatientSummary = false;
      }
    });
  }

  loadDoctorAppointmentSummary(): void {
    this.isLoadingDoctorSummary = true;
    this.doctorSummaryError = null;
    this.adminService.getDoctorAppointmentSummary().subscribe({
      next: (response: DoctorAppointmentSummaryAnalytics) => {
        this.doctorAppointmentSummary = response.summary || [];
        this.isLoadingDoctorSummary = false;
      },
      error: (err: Error) => {
        console.error('Error fetching doctor appointment summary:', err);
        this.doctorSummaryError = err.message || 'Could not load doctor appointment summary.';
        this.isLoadingDoctorSummary = false;
      }
    });
  }

  // Navigation method for quick actions
  navigateTo(path: string): void {
    this.router.navigate([`/admin/${path}`]); // Navigate relative to admin module base
  }
}