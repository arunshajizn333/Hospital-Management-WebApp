import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router'; // If you need navigation to a detailed view
import { AdminService } from '../../services/admin.service'; // Adjust path
import { Patient, PatientsApiResponse } from '../../../../shared/models/patient.model'; // Adjust path


@Component({
  selector: 'app-admin-view-patients',
  standalone: false,
  templateUrl: './admin-view-patients.component.html',
  styleUrl: './admin-view-patients.component.css'
})
export class AdminViewPatientsComponent implements OnInit {
  patients: Patient[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  filterForm!: FormGroup;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10; // Or your preferred default
  totalPatients = 0;
  totalPages = 0;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router // For future navigation to patient detail view
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [''],
      email: [''],
      // status: [''] // If you add an isActive/status filter later
    });

    this.loadPatients();

    // Optional: Reload patients when filter values change
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1; // Reset to first page on new filter
      this.loadPatients();
    });
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const filters = this.filterForm.value;

    this.adminService.getAllPatients(
      { name: filters.name || undefined, email: filters.email || undefined /*, status: filters.status || undefined*/ },
      this.currentPage,
      this.itemsPerPage
    ).subscribe({
      next: (response: PatientsApiResponse) => {
        this.patients = response.patients || [];
        this.totalPatients = response.total || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error("Error fetching patients for admin:", err);
        this.errorMessage = err.message || "Could not load patients list.";
        this.isLoading = false;
      }
    });
  }

  onFilterSubmit(): void { // If you want an explicit apply filter button
    this.currentPage = 1;
    this.loadPatients();
  }

  clearFilters(): void {
    this.filterForm.reset({ name: '', email: '' /*, status: ''*/ });
    // loadPatients() will be called by valueChanges subscription or you can call it explicitly
    // this.currentPage = 1;
    // this.loadPatients();
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

  viewPatientDetails(patientId: string): void {
    // Placeholder for navigating to a more detailed patient view for admin if needed
    console.log('Admin viewing details for patient ID:', patientId);
    // this.router.navigate(['/admin/patients', patientId, 'details']); // Example route
  }

  managePatientStatus(patientId: string, currentStatus: boolean | undefined): void {
    // Placeholder for future functionality like activating/deactivating a patient
    console.log('Managing status for patient ID:', patientId, 'Current status:', currentStatus);
    // This would involve calling a service method to update status and then reloading patients.
  }
}