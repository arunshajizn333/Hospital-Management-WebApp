import { Component, OnInit } from '@angular/core';
import { AppointmentService, UpdateAppointmentStatusData } from '../../../../core/services/appointment.service'; // Adjust path
import { Appointment, AppointmentsApiResponse } from '../../../../shared/models/appointment.model'; // Adjust path
import { Patient } from '../../../../shared/models/patient.model'; // For typing populated patient info
import { PopulatedDoctorInfo } from '../../../../shared/models/doctor.model'; // <<< IMPORT THIS

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

    this.appointmentService.getMyPatientAppointments(undefined, 'upcoming').subscribe({
      next: (allAppointments: Appointment[]) => { // Service returns Appointment[]
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        this.upcomingAppointments = allAppointments.filter(apt => {
            const apptDate = new Date(apt.appointmentDate);
            return apptDate >= today && !['CancelledByPatient', 'CancelledByDoctor', 'CancelledByAdmin', 'Completed', 'NoShow'].includes(apt.status);
        }).sort((a,b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime() || a.appointmentTime.localeCompare(b.appointmentTime));

        this.pastAppointments = allAppointments.filter(apt => {
            const apptDate = new Date(apt.appointmentDate);
            return apptDate < today || ['CancelledByPatient', 'CancelledByDoctor', 'CancelledByAdmin', 'Completed', 'NoShow'].includes(apt.status);
        }).sort((a,b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime() || b.appointmentTime.localeCompare(a.appointmentTime));

        this.isLoading = false;
      },
      error: (err: Error) => {
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
      next: (response: any) => { // Type 'any' if backend response varies for delete
        this.cancelSuccessMessage = response?.message || 'Appointment cancelled successfully.';
        this.loadAllMyAppointments(); // Refresh
        setTimeout(() => this.cancelSuccessMessage = null, 3000);
      },
      error: (err: Error) => {
        console.error('Error cancelling appointment:', err);
        this.cancelErrorMessage = err.message || 'Failed to cancel appointment.';
      }
    });
  }

  // --- CORRECTED HELPER METHODS to use PopulatedDoctorInfo ---
  getDoctorName(doctor: PopulatedDoctorInfo | string | undefined): string {
    if (doctor && typeof doctor === 'object' && doctor.name) {
      return doctor.name;
    }
    return 'N/A';
  }

  getDoctorSpecialization(doctor: PopulatedDoctorInfo | string | undefined): string | null {
    if (doctor && typeof doctor === 'object' && doctor.specialization) {
      return doctor.specialization;
    }
    return null;
  }
  // --- END CORRECTION ---

  isCancellable(appointment: Appointment): boolean {
    const cancellableStatuses = ['Scheduled', 'Confirmed'];
    // Optional: Add time-based rule
    return cancellableStatuses.includes(appointment.status);
  }
}