import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoctorService, MedicalRecordEntryData } from '../../services/doctor.service'; // Adjust path
import { Patient, MedicalRecordEntry, PopulatedDoctorInfo } from '../../../../shared/models/patient.model'; // Adjust path
import { AuthService } from '../../../../core/services/auth.service'; // To get current doctor's ID
import { User } from '../../../../shared/models/user.model'; // For current user type
import { Doctor } from '../../../../shared/models/doctor.model'; // For populated doctor in medical history

@Component({
  selector: 'app-doctor-patient-record',
  standalone: false,
  templateUrl: './doctor-patient-record.component.html',
  styleUrl: './doctor-patient-record.component.css'
})
export class DoctorPatientRecordComponent implements OnInit {
  patient: Patient | null = null;
  patientId: string | null = null;
  isLoadingPatient = true;
  patientError: string | null = null;

  currentDoctor: User | null = null; // For assigning doctorAttended

  addRecordForm!: FormGroup;
  isSubmittingRecord = false;
  addRecordSuccessMessage: string | null = null;
  addRecordErrorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentDoctor = this.authService.currentUserValue;
    this.patientId = this.route.snapshot.paramMap.get('patientId');

    if (this.patientId) {
      this.loadPatientDetails(this.patientId);
    } else {
      this.isLoadingPatient = false;
      this.patientError = 'No patient ID provided in the route.';
      console.error('Patient ID is missing from route parameters.');
    }

    this.addRecordForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(500)]],
      diagnosis: ['', Validators.maxLength(1000)],
      treatment: ['', Validators.maxLength(1000)]
      // doctorAttended will be automatically set to the logged-in doctor by the backend or service.
      // date will be set by the backend or service.
    });
  }

  loadPatientDetails(id: string): void {
    this.isLoadingPatient = true;
    this.patientError = null;
    this.doctorService.getPatientDetailsForDoctorView(id).subscribe({
      next: (data: Patient) => {
        this.patient = data;
        // Sort medical history, newest first
        if (this.patient && this.patient.medicalHistory) {
          this.patient.medicalHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        this.isLoadingPatient = false;
      },
      error: (err: Error) => {
        console.error('Error fetching patient details for doctor:', err);
        this.patientError = err.message || 'Could not load patient details.';
        this.isLoadingPatient = false;
      }
    });
  }

  // Getter for easy access to form controls in the template
  get arf() { return this.addRecordForm.controls; } // arf = Add Record Form

  onAddMedicalRecord(): void {
    this.addRecordSuccessMessage = null;
    this.addRecordErrorMessage = null;

    if (this.addRecordForm.invalid) {
      this.addRecordForm.markAllAsTouched();
      return;
    }
    if (!this.patientId) {
      this.addRecordErrorMessage = "Patient ID is missing. Cannot add record.";
      return;
    }

    this.isSubmittingRecord = true;
    const recordData: MedicalRecordEntryData = {
      description: this.arf['description'].value,
      diagnosis: this.arf['diagnosis'].value || undefined,
      treatment: this.arf['treatment'].value || undefined,
      // doctorAttended is handled by backend based on logged-in doctor
    };

    this.doctorService.addMedicalRecordForPatient(this.patientId, recordData).subscribe({
      next: (newRecord: MedicalRecordEntry) => {
        this.isSubmittingRecord = false;
        this.addRecordSuccessMessage = 'Medical record added successfully!';
        this.addRecordForm.reset();
        // Optionally, refresh the patient details to show the new record immediately
        this.loadPatientDetails(this.patientId as string); // Reload to get the latest history
        setTimeout(() => this.addRecordSuccessMessage = null, 3000);
      },
      error: (err: Error) => {
        console.error('Error adding medical record:', err);
        this.addRecordErrorMessage = err.message || 'Failed to add medical record.';
        this.isSubmittingRecord = false;
      }
    });
  }

  // Helper to get doctor's name if doctorAttended is populated in existing records
   getAttendingDoctorName(doctorAttended: PopulatedDoctorInfo | string | undefined): string {
    if (doctorAttended && typeof doctorAttended === 'object' && doctorAttended.name) {
      return doctorAttended.name;
    }
    // If it's just a string (ID), you could potentially fetch more details or display the ID.
    // For now, 'N/A' is a safe fallback if it's not a populated object with a name.
    return 'N/A';
  }

  goBackToPatientList(): void {
    this.router.navigate(['/doctor/my-patients']);
  }
}
