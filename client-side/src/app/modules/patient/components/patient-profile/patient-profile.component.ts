import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path as needed
import { PatientService } from '../../services/patient.service';     // Adjust path as needed
import { User } from '../../../../shared/models/user.model';          // Adjust path as needed
import { Patient } from '../../../../shared/models/patient.model';    // Adjust path as needed

@Component({
  selector: 'app-patient-profile',
  standalone: false,
  templateUrl: './patient-profile.component.html',
  styleUrl: './patient-profile.component.css'
})
export class PatientProfileComponent implements OnInit {
  currentUser: User | null = null; // To display name or basic info if needed
  patientProfile: Patient | null = null;
  profileForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.initEmptyForm(); // Initialize with empty structure first
    this.loadPatientProfile();
  }

  // Initialize form, optionally with patient data
  initEmptyForm(patientData?: Patient | null): void {
    let dobFormatted = '';
    if (patientData?.dateOfBirth) {
      // Assuming dateOfBirth is an ISO string or Date object.
      // HTML input type="date" expects "yyyy-MM-dd" format.
      const date = new Date(patientData.dateOfBirth);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const day = date.getDate().toString().padStart(2, '0');
      dobFormatted = `${year}-${month}-${day}`;
    }

    this.profileForm = this.fb.group({
      name: [patientData?.name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: [{ value: patientData?.email || this.currentUser?.email || '', disabled: true }, [Validators.required, Validators.email]], // Email usually not editable
      dateOfBirth: [dobFormatted, []], // Add Validators.required if DOB is mandatory
      gender: [patientData?.gender || '', []],
      contact_phone: [patientData?.contact?.phone || '', [Validators.pattern(/^\+?[0-9\s\-()]{7,20}$/)]],
      contact_address: [patientData?.contact?.address || '', [Validators.maxLength(250)]]
    });
  }

  loadPatientProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null; // Clear previous success messages
    this.patientService.getMyProfile().subscribe({
      next: (data: Patient) => {
        this.patientProfile = data;
        this.initEmptyForm(this.patientProfile); // Re-initialize form with fetched data
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching patient profile:', err);
        this.errorMessage = err.message || 'Could not load your profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Getter for easy access to form controls in the template
  get f() { return this.profileForm.controls; }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValues = this.profileForm.getRawValue(); // Use getRawValue() to get values of disabled controls like email if needed by backend, though we usually don't send email for update

    const profileDataToUpdate: Partial<Patient> = {
      name: formValues.name,
      // Only include fields if they have a value, or if backend handles null/empty to clear
      dateOfBirth: formValues.dateOfBirth || undefined,
      gender: formValues.gender || undefined,
      contact: {
        phone: formValues.contact_phone || undefined,
        address: formValues.contact_address || undefined
      }
    };

    // Clean up empty contact object/fields
    if (profileDataToUpdate.contact) {
        if (!profileDataToUpdate.contact.phone && !profileDataToUpdate.contact.address) {
            delete profileDataToUpdate.contact;
        } else {
            if (!profileDataToUpdate.contact.phone) delete profileDataToUpdate.contact.phone;
            if (!profileDataToUpdate.contact.address) delete profileDataToUpdate.contact.address;
        }
    }
    if(formValues.gender === '') delete profileDataToUpdate.gender; // Don't send empty string for gender if not selected
    if(formValues.dateOfBirth === '') delete profileDataToUpdate.dateOfBirth;


    this.patientService.updateMyProfile(profileDataToUpdate).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Profile updated successfully!';
        // The AuthService should have updated the currentUserValue via the tap operator in PatientService
        // If response.patient contains the full updated patient, use it:
        if (response.patient) {
            this.patientProfile = response.patient;
            this.initEmptyForm(this.patientProfile); // Re-initialize form with latest data
            this.profileForm.markAsPristine(); // Mark form as pristine after successful save
        } else {
            // If backend only returns a message, manually merge changes or reload
            this.loadPatientProfile(); // Simplest way to get fresh data
        }
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error updating patient profile:', err);
        this.errorMessage = err.message || 'Failed to update profile. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}