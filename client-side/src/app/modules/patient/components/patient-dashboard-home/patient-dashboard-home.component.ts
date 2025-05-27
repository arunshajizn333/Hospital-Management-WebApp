import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path
import { AppointmentService } from '../../../../core/services/appointment.service'; // Adjust path
import { User } from '../../../../shared/models/user.model'; // Adjust path
import { Appointment } from '../../../../shared/models/appointment.model'; // Adjust path
import { Doctor } from '../../../../shared/models/doctor.model';
import { Router } from '@angular/router';
import { PopulatedDoctorInfo } from '../../../../shared/models/doctor.model'; // Or wherever it's defined
import { PopulatedPatientInfo } from '../../../../shared/models/patient.model'; // For getPatientName


@Component({
  selector: 'app-patient-dashboard-home',
  standalone: false,
  templateUrl: './patient-dashboard-home.component.html',
  styleUrl: './patient-dashboard-home.component.css'
})
export class PatientDashboardHomeComponent implements OnInit {
  currentUser: User | null = null;
  upcomingAppointments: Appointment[] = [];
  isLoadingAppointments = true;
  appointmentsError: string | null = null;
  maxUpcomingAppointmentsToShow = 3; // Max appointments to show on dashboard

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
     private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadUpcomingAppointments();
  }

  loadUpcomingAppointments(): void {
    this.isLoadingAppointments = true;
    this.appointmentsError = null;
    // Fetch scheduled or confirmed, sorted by upcoming, limit to a few
    this.appointmentService.getMyPatientAppointments('Scheduled', 'upcoming', this.maxUpcomingAppointmentsToShow)
      .subscribe({
        next: (data) => {
          // The service already maps to response.appointments
          this.upcomingAppointments = data; 
          this.isLoadingAppointments = false;
        },
        error: (err) => {
          console.error('Error fetching upcoming appointments:', err);
          this.appointmentsError = err.message || 'Could not load upcoming appointments.';
          this.isLoadingAppointments = false;
        }
      });
  }
   getDoctorName(doctor: PopulatedDoctorInfo | string | undefined): string {
    if (doctor && typeof doctor === 'object' && doctor.name) {
      return doctor.name;
    }
    return 'N/A'; // Or some other placeholder
  }

  getDoctorSpecialization(doctor: PopulatedDoctorInfo  | string | undefined): string | null {
    if (doctor && typeof doctor === 'object' && doctor.specialization) {
      return doctor.specialization;
    }
    return null;
  }

   getPatientName(patient: PopulatedPatientInfo | string | undefined): string {
     if (patient && typeof patient === 'object' && patient.name) {
     return patient.name;
     }
     return 'N/A';
 }

    // Navigation methods for quick actions
   navigateTo(path: string): void {
    this.router.navigate([`/patient/${path}`]); // Navigate relative to patient module base
  }
}