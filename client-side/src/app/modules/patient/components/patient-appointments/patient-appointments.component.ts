import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../../core/services/appointment.service'; // Adjust path
import { Appointment } from '../../../../shared/models/appointment.model';         // Adjust path
import { Doctor } from '../../../../shared/models/doctor.model';    

@Component({
  selector: 'app-patient-appointments',
  standalone: false,
  templateUrl: './patient-appointments.component.html',
  styleUrl: './patient-appointments.component.css'
})
export class PatientAppointmentsComponent implements OnInit {
  upcomingAppointments: Appointment[] = [];
  pastAppointments: Appointment[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  cancelSuccessMessage: string | null = null;
  cancelErrorMessage: string | null = null;

  constructor(private appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.loadAllMyAppointments();
  }

  loadAllMyAppointments(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cancelSuccessMessage = null;
    this.cancelErrorMessage = null;

    // Fetch all appointments and then categorize them
    this.appointmentService.getMyPatientAppointments(undefined, 'upcoming').subscribe({ // Get all, sorted upcoming first by default
      next: (allAppointments) => {
        const now = new Date();
        // Normalize 'now' to just the date part for easier comparison with appointmentDate
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        this.upcomingAppointments = allAppointments.filter(apt => {
            const apptDate = new Date(apt.appointmentDate);
            return apptDate >= today && !['CancelledByPatient', 'CancelledByDoctor', 'CancelledByAdmin', 'Completed', 'NoShow'].includes(apt.status);
        }).sort((a,b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime() || a.appointmentTime.localeCompare(b.appointmentTime)); // Sort by date then time

        this.pastAppointments = allAppointments.filter(apt => {
            const apptDate = new Date(apt.appointmentDate);
            return apptDate < today || ['CancelledByPatient', 'CancelledByDoctor', 'CancelledByAdmin', 'Completed', 'NoShow'].includes(apt.status);
        }).sort((a,b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime() || b.appointmentTime.localeCompare(a.appointmentTime)); // Sort by date then time (desc)

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching appointments:', err);
        this.errorMessage = err.message || 'Could not load your appointments.';
        this.isLoading = false;
      }
    });
  }

  cancelAppointment(appointmentId: string): void {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    this.cancelSuccessMessage = null;
    this.cancelErrorMessage = null;

    this.appointmentService.cancelPatientAppointment(appointmentId).subscribe({
      next: (response) => {
        this.cancelSuccessMessage = response?.message || 'Appointment cancelled successfully.';
        // Refresh the lists
        this.loadAllMyAppointments();
        setTimeout(() => this.cancelSuccessMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error cancelling appointment:', err);
        this.cancelErrorMessage = err.message || 'Failed to cancel appointment.';
      }
    });
  }

  // Helper methods for template display (if needed, similar to PatientDashboardHomeComponent)
  getDoctorName(doctor: Doctor | string | undefined): string {
    if (doctor && typeof doctor === 'object' && doctor.name) {
      return doctor.name;
    }
    return 'N/A';
  }

  getDoctorSpecialization(doctor: Doctor | string | undefined): string | null {
    if (doctor && typeof doctor === 'object' && doctor.specialization) {
      return doctor.specialization;
    }
    return null;
  }

  isCancellable(appointment: Appointment): boolean {
    const cancellableStatuses = ['Scheduled', 'Confirmed'];
    // Optional: Add time-based rule, e.g., cannot cancel if appointmentDate is within 24 hours
    // const appointmentDateTime = new Date(`${new Date(appointment.appointmentDate).toISOString().split('T')[0]}T${appointment.appointmentTime}`);
    // const now = new Date();
    // const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    // if (hoursDifference < 24) return false;
    return cancellableStatuses.includes(appointment.status);
  }
}