import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppointmentService, UpdateAppointmentStatusData } from '../../../../core/services/appointment.service'; // Adjust path
import { Appointment, AppointmentsApiResponse } from '../../../../shared/models/appointment.model'; // Adjust path, ensure AppointmentsApiResponse is imported
import { Patient,PopulatedPatientInfo } from '../../../../shared/models/patient.model'; // For typing populated patient info

@Component({
  selector: 'app-doctor-appointments',
  standalone: false,
  templateUrl: './doctor-appointments.component.html',
  styleUrl: './doctor-appointments.component.css'
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  updateStatusMessage: string | null = null;
  updateStatusError: string | null = null;

  filterForm!: FormGroup;
  appointmentStatuses: string[] = ['Scheduled', 'Confirmed', 'Completed', 'CancelledByPatient', 'CancelledByDoctor', 'CancelledByAdmin', 'NoShow'];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalAppointments = 0;
  totalPages = 0;

  selectedAppointmentForStatusUpdate: Appointment | null = null;
  newStatus: UpdateAppointmentStatusData['status'] | '' = '';
  doctorNotesForUpdate: string = '';

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''], // YYYY-MM-DD format
      status: [''] // Default to all, or 'Scheduled,Confirmed'
    });
    this.loadDoctorAppointments();

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadDoctorAppointments();
    });
  }

 loadDoctorAppointments(): void {
  this.isLoading = true;
  this.errorMessage = null;
  const filters = this.filterForm.value;

  this.appointmentService.getMyAppointmentsAsDoctor(
    filters.status || undefined,
    filters.date || undefined,
    'date_asc',
    this.currentPage,
    this.itemsPerPage
  ).subscribe({
    next: (response: AppointmentsApiResponse) => { // This typing is correct
      this.appointments = response.appointments || [];
      this.totalAppointments = response.total || 0;   // Should now work
      this.totalPages = response.totalPages || 0;     // Should now work
      this.isLoading = false;
    },
    error: (err: Error) => {
      console.error("Error fetching doctor's appointments:", err);
      this.errorMessage = err.message || "Could not load appointments.";
      this.isLoading = false;
    }
  });
}

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDoctorAppointments();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDoctorAppointments();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDoctorAppointments();
    }
  }

  openStatusUpdateModal(appointment: Appointment): void {
    this.selectedAppointmentForStatusUpdate = { ...appointment };
    this.newStatus = appointment.status as UpdateAppointmentStatusData['status']; // Pre-fill
    this.doctorNotesForUpdate = appointment.doctorNotes || '';
    this.updateStatusMessage = null;
    this.updateStatusError = null;
    console.log("Opening status update for:", appointment._id);
  }

  submitStatusUpdate(): void {
    if (!this.selectedAppointmentForStatusUpdate || !this.newStatus) {
      this.updateStatusError = "Please select a valid status.";
      return;
    }

    this.updateStatusMessage = null;
    this.updateStatusError = null;

    const statusData: UpdateAppointmentStatusData = {
      status: this.newStatus,
      doctorNotes: this.doctorNotesForUpdate || undefined
    };

    this.appointmentService.updateAppointmentStatusByDoctor(this.selectedAppointmentForStatusUpdate._id, statusData)
      .subscribe({
        next: (updatedAppointment: Appointment) => { // Expecting updated Appointment
          this.updateStatusMessage = `Appointment status updated to ${updatedAppointment.status}.`;
          this.selectedAppointmentForStatusUpdate = null;
          this.newStatus = '';
          this.doctorNotesForUpdate = '';
          this.loadDoctorAppointments(); // Refresh the list
          setTimeout(() => this.updateStatusMessage = null, 3000);
        },
        error: (err: Error) => { // Typed err
          console.error("Error updating appointment status:", err);
          this.updateStatusError = err.message || "Failed to update appointment status.";
        }
      });
  }

  cancelStatusUpdate(): void {
    this.selectedAppointmentForStatusUpdate = null;
    this.newStatus = '';
    this.doctorNotesForUpdate = '';
    this.updateStatusError = null;
  }

 getPatientName(patient: PopulatedPatientInfo | string | undefined): string { // <<< CORRECTED TYPE HERE
    if (patient && typeof patient === 'object' && patient.name) {
      return patient.name;
    }
    return 'N/A';
  }
}
