// src/app/modules/patient/components/patient-medical-records/patient-medical-records.component.ts
import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { MedicalRecordEntry, Patient } from '../../../../shared/models/patient.model';
// No need to import the full Doctor interface if we only use parts of it or a specific sub-type

// Define a simpler interface for the populated doctor within medical records,
// aligning with what your backend actually populates and what your template uses.
interface PopulatedDoctorInfo {
  _id: string;
  name: string;
  specialization?: string; // Keep it optional to match the error and allow flexibility
}
@Component({
  selector: 'app-patient-medical-records',
  standalone: false,
  templateUrl: './patient-medical-records.component.html',
  styleUrl: './patient-medical-records.component.css'
})
export class PatientMedicalRecordsComponent implements OnInit {
  medicalRecords: MedicalRecordEntry[] = []; // MedicalRecordEntry should use PopulatedDoctorInfo or similar
  isLoading = true;
  errorMessage: string | null = null;
  patientName: string | null = null;

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
    this.loadMedicalRecords();
  }

  loadMedicalRecords(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.patientService.getMyProfile().subscribe({
      next: (patientData: Patient) => {
        this.patientName = patientData.name;
        // Cast doctorAttended if necessary when assigning to medicalRecords
        this.medicalRecords = (patientData.medicalHistory || []).map(record => ({
          ...record,
          doctorAttended: record.doctorAttended as (PopulatedDoctorInfo | string | undefined) // Explicit cast
        }));
        this.medicalRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching medical records:', err);
        this.errorMessage = err.message || 'Could not load your medical records.';
        this.isLoading = false;
      }
    });
  }

  getAttendingDoctorName(doctorAttended: PopulatedDoctorInfo | string | undefined): string {
    if (doctorAttended && typeof doctorAttended === 'object' && doctorAttended.name) {
      return doctorAttended.name;
    }
    return 'N/A';
  }

  // If you also display specialization from medicalRecord.doctorAttended directly in template:
  getAttendingDoctorSpecialization(doctorAttended: PopulatedDoctorInfo | string | undefined): string | null {
    if (doctorAttended && typeof doctorAttended === 'object' && doctorAttended.specialization) {
      return doctorAttended.specialization;
    }
    return null;
  }
}