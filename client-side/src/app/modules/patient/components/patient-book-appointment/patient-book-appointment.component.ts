import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Removed unused map import from rxjs/operators if it was here
// Make sure paths to services and models are correct
import { PublicDataService } from '../../../../core/services/public-data.service';
import { AppointmentService, BookAppointmentData } from '../../../../core/services/appointment.service'; // Ensure BookAppointmentData is exported from service or a model file
import { Department } from '../../../../shared/models/department.model';
import { Doctor } from '../../../../shared/models/doctor.model'; // Removed DoctorsApiResponse as it's not directly used here
import { Appointment, BookAppointmentResponse } from '../../../../shared/models/appointment.model'; // Import BookAppointmentResponse


@Component({
  selector: 'app-patient-book-appointment',
  standalone: false,
  templateUrl: './patient-book-appointment.component.html',
  styleUrl: './patient-book-appointment.component.css'
})
export class PatientBookAppointmentComponent implements OnInit {
  // Step 1: Department Selection
  departments: Department[] = [];
  isLoadingDepartments = false;
  departmentError: string | null = null;
  selectedDepartmentId: string | null = null;

  // Step 2: Doctor Selection
  doctorsInDepartment: Doctor[] = [];
  isLoadingDoctors = false;
  doctorError: string | null = null;
  selectedDoctorId: string | null = null;

  // Step 3: Date & Slot Selection
  selectedDate: string | null = null; // YYYY-MM-DD
  availableSlots: string[] = [];
  isLoadingSlots = false;
  slotsError: string | null = null;

  // Step 4: Booking Form
  bookingForm!: FormGroup;
  isSubmittingBooking = false;
  bookingSuccessMessage: string | null = null;
  bookingErrorMessage: string | null = null;

  currentStep = 1;

  constructor(
    private fb: FormBuilder,
    private publicDataService: PublicDataService,
    private appointmentService: AppointmentService
  ) { }

  ngOnInit(): void {
    this.loadDepartments();
    this.bookingForm = this.fb.group({
      appointmentTime: ['', Validators.required],
      reason: ['', Validators.maxLength(500)],
      patientNotes: ['', Validators.maxLength(500)]
    });
  }

  loadDepartments(): void {
    this.isLoadingDepartments = true;
    this.departmentError = null;
    this.publicDataService.getDepartments().subscribe({
      next: (data: Department[]) => { // Added type
        this.departments = data;
        this.isLoadingDepartments = false;
      },
      error: (err: Error) => { // Added type
        this.departmentError = err.message || 'Could not load departments.';
        this.isLoadingDepartments = false;
      }
    });
  }

  onDepartmentChange(departmentId: string | null): void {
    this.selectedDepartmentId = departmentId;
    this.selectedDoctorId = null;
    this.doctorsInDepartment = [];
    this.selectedDate = null;
    this.availableSlots = [];
    this.bookingForm.patchValue({ appointmentTime: '' });

    if (departmentId) {
      this.loadDoctorsByDepartment(departmentId);
      this.currentStep = 2;
    } else {
      this.currentStep = 1;
    }
  }

  loadDoctorsByDepartment(departmentId: string): void {
    this.isLoadingDoctors = true;
    this.doctorError = null;
    this.publicDataService.getPublicDoctorsList({ departmentId: departmentId }, 1, 100)
      .subscribe({ // Removed the .pipe(map(...)) from here
        next: (data: Doctor[]) => { // Service should now return Doctor[]
          this.doctorsInDepartment = data;
          console.log(data);
          
          this.isLoadingDoctors = false;
        },
        error: (err: Error) => { // Added type
          this.doctorError = err.message || 'Could not load doctors for this department.';
          this.isLoadingDoctors = false;
        }
      });
  }

  onDoctorChange(doctorId: string | null): void {
    this.selectedDoctorId = doctorId;
    this.selectedDate = null;
    this.availableSlots = [];
    this.bookingForm.patchValue({ appointmentTime: '' });

    if (doctorId) {
      this.currentStep = 3;
    } else {
      this.currentStep = 2;
    }
  }

  onDateChange(date: string | null): void {
    this.selectedDate = date;
    this.availableSlots = [];
    this.slotsError = null; // Reset slots error
    this.bookingForm.patchValue({ appointmentTime: '' });
    if (this.selectedDoctorId && this.selectedDate) {
      this.loadAvailableSlots(this.selectedDoctorId, this.selectedDate);
    }
  }

  loadAvailableSlots(doctorId: string, date: string): void {
    this.isLoadingSlots = true;
    this.slotsError = null;
    this.appointmentService.getDoctorAvailableSlots(doctorId, date).subscribe({
        next: (slots: string[]) => { // Added type
            this.availableSlots = slots;
            this.isLoadingSlots = false;
            if (slots.length === 0) {
                this.slotsError = 'No slots available for this date. Please select another date.';
            }
        },
        error: (err: Error) => { // Added type
            this.slotsError = err.message || 'Could not load available slots.';
            this.isLoadingSlots = false;
        }
    });
  }
  
  onSubmitBooking(): void {
    if (!this.selectedDoctorId || !this.selectedDate || this.bookingForm.invalid || !this.bookingForm.get('appointmentTime')?.value) {
      this.bookingErrorMessage = "Please complete all previous steps and select a time slot.";
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmittingBooking = true;
    this.bookingSuccessMessage = null;
    this.bookingErrorMessage = null;

    const bookingData: BookAppointmentData = {
      doctorId: this.selectedDoctorId,
      appointmentDate: this.selectedDate,
      appointmentTime: this.bookingForm.value.appointmentTime,
      reason: this.bookingForm.value.reason,
      patientNotes: this.bookingForm.value.patientNotes
    };

    this.appointmentService.bookAppointment(bookingData).subscribe({
      next: (response: BookAppointmentResponse) => { // Use BookAppointmentResponse
        this.isSubmittingBooking = false;
        this.bookingSuccessMessage = response.message || 'Appointment booked successfully!';
        this.resetBookingFlow();
      },
      error: (err: Error) => { // Added type
        this.isSubmittingBooking = false;
        this.bookingErrorMessage = err.message || 'Failed to book appointment. The slot may have just been taken or an error occurred.';
      }
    });
  }

  resetBookingFlow(): void {
    this.currentStep = 1;
    this.selectedDepartmentId = null;
    this.selectedDoctorId = null;
    this.selectedDate = null;
    this.doctorsInDepartment = [];
    this.availableSlots = [];
    this.slotsError = null;
    this.bookingForm.reset();
  }

  isStepActive(step: number): boolean {
    if (step === 1) return true;
    if (step === 2) return !!this.selectedDepartmentId;
    if (step === 3) return !!this.selectedDoctorId;
    if (step === 4) return !!this.selectedDoctorId && !!this.selectedDate && !!this.bookingForm.get('appointmentTime')?.value; // Only active if a time is selected
    return false;
  }

  getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }
}