// src/app/modules/admin/components/admin-view-appointments/admin-view-appointments.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Appointment, AppointmentsApiResponse } from '../../../../shared/models/appointment.model';
import { Doctor } from '../../../../shared/models/doctor.model'; // For PopulatedDoctorInfo typing
import { Patient } from '../../../../shared/models/patient.model'; // For PopulatedPatientInfo typing

// Define simple interfaces for populated info if not already globally available
interface PopulatedDoctorInfo {
  _id: string;
  name: string;
  specialization?: string;
}

interface PopulatedPatientInfo {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-admin-view-appointments',
  standalone: false,
  templateUrl: './admin-view-appointments.component.html',
  styleUrl: './admin-view-appointments.component.css'
})
export class AdminViewAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  filterForm!: FormGroup;
  appointmentStatuses: string[] = ['Scheduled', 'Confirmed', 'Completed', 'CancelledByPatient', 'CancelledByDoctor', 'CancelledByAdmin', 'NoShow'];
  
  currentPage = 1;
  itemsPerPage = 10;
  totalAppointments = 0;
  totalPages = 0;

  selectedAppointment: Appointment | null = null;
  showManageModal = false; 
  manageForm!: FormGroup;
  isSubmittingUpdate = false;
  updateSuccessMessage: string | null = null;
  updateErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      doctorId: [''],
      patientId: [''],
      status: [''],
      dateFrom: [''],
      dateTo: ['']
    });
    this.loadAllSystemAppointments();
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadAllSystemAppointments();
    });
    this.manageForm = this.fb.group({
        appointmentDate: ['', Validators.required], // Ensure Validators is imported
        appointmentTime: ['', Validators.required],
        status: ['', Validators.required],
        reason: [''],
        patientNotes: [''],
        doctorNotes: ['']
    });
  }

  loadAllSystemAppointments(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const filters = this.filterForm.value;
    const activeFilters = {
        doctorId: filters.doctorId || undefined,
        patientId: filters.patientId || undefined,
        status: filters.status || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined
    };
    this.adminService.getAllSystemAppointments(activeFilters, this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response: AppointmentsApiResponse) => {
          this.appointments = response.appointments || [];
          this.totalAppointments = response.total || 0;
          this.totalPages = response.totalPages || 0;
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.errorMessage = err.message || "Could not load appointments.";
          this.isLoading = false;
        }
      });
  }

  // ... (onFilterSubmit, clearFilters, goToPage, prevPage, nextPage methods) ...
  onFilterSubmit(): void { this.currentPage = 1; this.loadAllSystemAppointments(); }
  clearFilters(): void { this.filterForm.reset({ doctorId: '', patientId: '', status: '', dateFrom: '', dateTo: ''}); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.loadAllSystemAppointments(); } }
  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadAllSystemAppointments(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadAllSystemAppointments(); } }


  openManageModal(appointment: Appointment): void {
    this.selectedAppointment = { ...appointment };
    this.updateSuccessMessage = null;
    this.updateErrorMessage = null;
    const dateForInput = appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '';
    this.manageForm.patchValue({
      appointmentDate: dateForInput,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      reason: appointment.reason || '',
      patientNotes: appointment.patientNotes || '',
      doctorNotes: appointment.doctorNotes || ''
    });
    this.showManageModal = true;
  }

  closeManageModal(): void {
    this.showManageModal = false;
    this.selectedAppointment = null;
    this.manageForm.reset();
  }

  onManageFormSubmit(): void {
    if (!this.selectedAppointment || this.manageForm.invalid) {
      this.manageForm.markAllAsTouched();
      this.updateErrorMessage = "Please correct the errors in the form.";
      return;
    }
    this.isSubmittingUpdate = true;
    this.updateSuccessMessage = null;
    this.updateErrorMessage = null;
    const formValues = this.manageForm.value;
    const updateData: Partial<Appointment> = {
        appointmentDate: formValues.appointmentDate ? new Date(formValues.appointmentDate).toISOString() : undefined,
        appointmentTime: formValues.appointmentTime,
        status: formValues.status,
        reason: formValues.reason,
        patientNotes: formValues.patientNotes,
        doctorNotes: formValues.doctorNotes
    };
    Object.keys(updateData).forEach(key => 
        (updateData as any)[key] === undefined && delete (updateData as any)[key]
    );
    this.adminService.manageAppointmentByAdmin(this.selectedAppointment._id, updateData)
        .subscribe({
            next: (updatedAppointment: Appointment) => {
                this.isSubmittingUpdate = false;
                this.updateSuccessMessage = "Appointment updated successfully by admin.";
                this.closeManageModal();
                this.loadAllSystemAppointments();
                setTimeout(() => this.updateSuccessMessage = null, 3000);
            },
            error: (err: Error) => {
                this.isSubmittingUpdate = false;
                this.updateErrorMessage = err.message || "Failed to update appointment.";
            }
        });
  }

  // Updated Helper Methods
  getNestedName(item: PopulatedPatientInfo | PopulatedDoctorInfo | string | undefined): string {
    if (item && typeof item === 'object' && item.name) {
      return item.name;
    }
    return 'N/A';
  }

  getDoctorSpecialization(doctor: PopulatedDoctorInfo | string | undefined): string | null {
    if (doctor && typeof doctor === 'object' && doctor.specialization) {
      return doctor.specialization;
    }
    return null;
  }
}
