import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path
import { DoctorService } from '../../services/doctor.service';     // Adjust path
import { User } from '../../../../shared/models/user.model';          // Adjust path
import { Doctor } from '../../../../shared/models/doctor.model';    // Adjust path, ensure Department is imported if used
import { Department } from '../../../../shared/models/department.model';    // Adjust path, ensure Department is imported if used

@Component({
  selector: 'app-doctor-profile',
  standalone: false,
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css'
})
export class DoctorProfileComponent implements OnInit {
  currentDoctor: Doctor | null = null; // Store full doctor profile
  profileForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Fields an admin typically manages and are read-only for the doctor here
  adminManagedFields = {
    email: '',
    specialization: '',
    departmentName: ''
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // For initial user context if needed, and for linking to change password
    private doctorService: DoctorService
  ) { }

  ngOnInit(): void {
    this.initEmptyForm(); // Initialize with empty structure
    this.loadDoctorProfile();
  }

  initEmptyForm(doctor?: Doctor | null): void {
    this.profileForm = this.fb.group({
      // Fields doctor can edit
      phone: [doctor?.phone || '', [Validators.pattern(/^\+?[0-9\s\-()]{7,20}$/)]],
      publicBio: [doctor?.publicBio || '', [Validators.maxLength(1000)]],
      photoUrl: [doctor?.photoUrl || '', []] // Add URL validation if desired
      // availabilitySchedule and availabilityOverrides are managed in a separate component
    });

    // Store read-only fields separately for display
    if (doctor) {
      this.adminManagedFields.email = doctor.email;
      this.adminManagedFields.specialization = doctor.specialization || 'Not set';
      if (doctor.department && typeof doctor.department === 'object') {
        this.adminManagedFields.departmentName = (doctor.department as Department).name || 'Not assigned';
      } else {
        this.adminManagedFields.departmentName = 'Not assigned';
      }
    }
  }

  loadDoctorProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.doctorService.getMyProfile().subscribe({
      next: (data: Doctor) => {
        this.currentDoctor = data;
        this.initEmptyForm(this.currentDoctor);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching doctor profile:', err);
        this.errorMessage = err.message || 'Could not load your profile.';
        this.isLoading = false;
      }
    });
  }

  get f() { return this.profileForm.controls; }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const profileDataToUpdate: Partial<Doctor> = {
      phone: this.profileForm.value.phone || undefined,
      publicBio: this.profileForm.value.publicBio || undefined,
      photoUrl: this.profileForm.value.photoUrl || undefined
    };

    // Filter out undefined fields to only send what has a value
    Object.keys(profileDataToUpdate).forEach(key => 
        profileDataToUpdate[key as keyof Partial<Doctor>] === undefined && delete profileDataToUpdate[key as keyof Partial<Doctor>]
    );
    // If an empty string should clear a field, send null instead of undefined,
    // or ensure backend handles empty strings appropriately.

    this.doctorService.updateMyProfile(profileDataToUpdate).subscribe({
      next: (updatedDoctor: Doctor) => {
        this.isSubmitting = false;
        this.successMessage = 'Profile updated successfully!'; // Backend message might be in updatedDoctor.message if UpdateDoctorProfileResponse was used
        this.currentDoctor = updatedDoctor; // Update local profile data
        this.initEmptyForm(this.currentDoctor); // Re-initialize form
        this.profileForm.markAsPristine();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error updating doctor profile:', err);
        this.errorMessage = err.message || 'Failed to update profile.';
        this.isSubmitting = false;
      }
    });
  }
}
