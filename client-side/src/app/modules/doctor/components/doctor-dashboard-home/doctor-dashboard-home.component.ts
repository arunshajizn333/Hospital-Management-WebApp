// src/app/modules/doctor/components/doctor-dashboard-home/doctor-dashboard-home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../shared/models/user.model';
import { Appointment, AppointmentsApiResponse } from '../../../../shared/models/appointment.model'; // Ensure AppointmentsApiResponse is imported
import { PopulatedDoctorInfo } from '../../../../shared/models/doctor.model'; // Import this
import { PopulatedPatientInfo } from '../../../../shared/models/patient.model'; // <<< IMPORT THIS

@Component({
  selector: 'app-doctor-dashboard-home',
  standalone: false,
  templateUrl: './doctor-dashboard-home.component.html',
  styleUrl: './doctor-dashboard-home.component.css'
})
export class DoctorDashboardHomeComponent implements OnInit {
  currentDoctor: User | null = null;
  todaysAppointments: Appointment[] = [];
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
      1, // page 1 for summary
      this.maxAppointmentsToShow
    ).subscribe({
      next: (response: AppointmentsApiResponse) => {
        this.todaysAppointments = response.appointments || [];
        this.isLoadingAppointments = false;
      },
      error: (err: Error) => {
        console.error("Error fetching today's appointments for doctor:", err);
        this.appointmentsError = err.message || "Could not load today's appointments.";
        this.isLoadingAppointments = false;
      }
    });
  }

  // Helper method to safely get patient's name
  getPatientName(patient: PopulatedPatientInfo | string | undefined): string { // <<< CORRECTED TYPE
    if (patient && typeof patient === 'object' && patient.name) {
      return patient.name;
    }
    return 'N/A';
  }

  // Helper method to safely get doctor's name
  getDoctorName(doctor: PopulatedDoctorInfo | string | undefined): string { // <<< CORRECTED TYPE
    if (doctor && typeof doctor === 'object' && doctor.name) {
      return doctor.name;
    }
    return 'N/A';
  }

  // Helper method to safely get doctor's specialization
  getDoctorSpecialization(doctor: PopulatedDoctorInfo | string | undefined): string | null { // <<< CORRECTED TYPE
    if (doctor && typeof doctor === 'object' && doctor.specialization) {
      return doctor.specialization;
    }
    return null;
  }

  navigateTo(path: string): void {
    this.router.navigate([`/doctor/${path}`]);
  }
}