

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; // For search/filter form
import { Router } from '@angular/router';
import { DoctorService } from '../../services/doctor.service'; // Adjust path
import { Patient, PatientsApiResponse } from '../../../../shared/models/patient.model'; // Adjust path

@Component({
  selector: 'app-doctor-patient-list',
  standalone: false,
  templateUrl: './doctor-patient-list.component.html',
  styleUrl: './doctor-patient-list.component.css'
})
export class DoctorPatientListComponent implements OnInit {
  patients: Patient[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  searchForm!: FormGroup;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10; // Or your preferred default
  totalPatients = 0;
  totalPages = 0;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchQuery: [''] // For patient name or email search
    });

    this.loadPatients();

    // Optional: Reload patients when search query changes (with debounce)
    // this.searchForm.get('searchQuery')?.valueChanges.pipe(
    //   debounceTime(300), // Wait for 300ms pause in events
    //   distinctUntilChanged() // Only emit if value has changed
    // ).subscribe(() => {
    //   this.currentPage = 1; // Reset to first page on new search
    //   this.loadPatients();
    // });
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const searchQuery = this.searchForm.value.searchQuery || undefined;

    this.doctorService.getMyPatients(searchQuery, this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response: PatientsApiResponse) => {
          this.patients = response.patients || [];
          this.totalPatients = response.total || 0;
          this.totalPages = response.totalPages || 0;
          // this.currentPage is already set
          this.isLoading = false;
        },
        error: (err: Error) => {
          console.error("Error fetching doctor's patients:", err);
          this.errorMessage = err.message || "Could not load patients.";
          this.isLoading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPatients();
  }

  clearSearch(): void {
    this.searchForm.get('searchQuery')?.setValue('');
    this.currentPage = 1;
    this.loadPatients();
  }

  // Pagination: Go to a specific page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPatients();
    }
  }

  // Pagination: Previous page
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPatients();
    }
  }

  // Pagination: Next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPatients();
    }
  }

  viewPatientRecords(patientId: string): void {
    // Navigate to the patient record component, passing the patientId
    // The route should be defined in DoctorRoutingModule, e.g., 'my-patients/:patientId/records'
    this.router.navigate(['/doctor/my-patients', patientId, 'records']);
  }
}
