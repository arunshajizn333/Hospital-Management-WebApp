import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service'; // Ensure this path is correct
import { User } from '../../../../shared/models/user.model';
import { Appointment, AppointmentsApiResponse } from '../../../../shared/models/appointment.model'; // Ensure AppointmentsApiResponse is imported
import { Patient } from '../../../../shared/models/patient.model'; // For typing populated patient
// import { Doctor } from '../../../../shared/models/doctor.model'; // Not strictly needed if not using specific Doctor type here

@Component({
  selector: 'app-doctor-dashboard-home',
  standalone: false,
  templateUrl: './doctor-dashboard-home.component.html',
  styleUrl: './doctor-dashboard-home.component.css'
})
export class DoctorDashboardHomeComponent implements OnInit {
  currentDoctor: User | null = null;
  todaysAppointments: Appointment[] = []; // This expects an array of Appointment
  isLoadingAppointments = true;
  appointmentsError: string | null = null;
  readonly maxAppointmentsToShow = 5;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentDoctor = this.authService.currentUserValue;
    this.loadTodaysAppointments();
  }

  loadTodaysAppointments(): void {
    this.isLoadingAppointments = true;
    this.appointmentsError = null;

    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];

    this.appointmentService.getMyAppointmentsAsDoctor(
      'Scheduled,Confirmed',
      todayDateString,
      'time_asc',
      1, // page for summary
      this.maxAppointmentsToShow
    ).subscribe({
      next: (response: AppointmentsApiResponse) => { // response is the full API response object
        this.todaysAppointments = response.appointments || []; // <<<< CORRECTED ASSIGNMENT HERE
        this.isLoadingAppointments = false;
        // You don't need to access response.total or response.totalPages here for this summary view
      },
      error: (err: Error) => {
        console.error("Error fetching today's appointments for doctor:", err);
        this.appointmentsError = err.message || "Could not load today's appointments.";
        this.isLoadingAppointments = false;
      }
    });
  }

  getPatientName(patient: Patient | string | undefined): string {
    if (patient && typeof patient === 'object' && patient.name) {
      return patient.name;
    }
    return 'N/A';
  }

  navigateTo(path: string): void {
    this.router.navigate([`/doctor/${path}`]);
  }
}