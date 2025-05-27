import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service'; // Adjust path
import { Department, DepartmentsApiResponse } from '../../../../shared/models/department.model'; // Adjust path

@Component({
  selector: 'app-admin-manage-departments',
  standalone: false,
  templateUrl: './admin-manage-departments.component.html',
  styleUrl: './admin-manage-departments.component.css'
})
export class AdminManageDepartmentsComponent implements OnInit {
  departments: Department[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  departmentForm!: FormGroup;
  isEditMode = false;
  editingDepartmentId: string | null = null;
  showDepartmentForm = false; // To toggle visibility of the add/edit form/modal
  isSubmittingForm = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10; // Or your preferred default
  totalDepartments = 0;
  totalPages = 0;

  // Filter (optional, can be added later if needed for departments)
  // filterForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.initDepartmentForm();
    this.loadDepartments();
  }

  initDepartmentForm(department?: Department | null): void {
    this.departmentForm = this.fb.group({
      name: [department?.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [department?.description || '', [Validators.maxLength(1000)]],
      imageUrl: [department?.imageUrl || ''], // Add URL validation if needed
      servicesOffered: this.fb.array(
        (department?.servicesOffered || []).map(service => this.fb.control(service, Validators.maxLength(100)))
      )
      // active: [department ? department.active : true] // If you add an 'active' flag
    });
  }

  // Getter for servicesOffered FormArray
  get servicesOfferedFormArray(): FormArray {
    return this.departmentForm.get('servicesOffered') as FormArray;
  }

  addServiceOffered(): void {
    this.servicesOfferedFormArray.push(this.fb.control('', Validators.maxLength(100)));
  }

  removeServiceOffered(index: number): void {
    this.servicesOfferedFormArray.removeAt(index);
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.errorMessage = null;
    // For now, no complex filters for department list, just pagination
    this.adminService.getDepartments(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: DepartmentsApiResponse) => {
        this.departments = response.departments || [];
        this.totalDepartments = response.total || 0; 
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage = err.message || "Could not load departments.";
        this.isLoading = false;
      }
    });
  }

  openAddDepartmentModal(): void {
    this.isEditMode = false;
    this.editingDepartmentId = null;
    this.initDepartmentForm(); // Reset form for new department
    this.successMessage = null;
    this.errorMessage = null; // Clear form-specific error
    this.showDepartmentForm = true;
  }

  openEditDepartmentModal(department: Department): void {
    this.isEditMode = true;
    this.editingDepartmentId = department._id;
    this.initDepartmentForm(department); // Populate form
    this.successMessage = null;
    this.errorMessage = null; // Clear form-specific error
    this.showDepartmentForm = true;
  }

  closeDepartmentFormModal(): void {
    this.showDepartmentForm = false;
    this.editingDepartmentId = null;
    this.isEditMode = false;
  }

  onDepartmentFormSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      this.errorMessage = "Please correct the errors in the form.";
      return;
    }

    this.isSubmittingForm = true;
    const departmentData: Partial<Department> = this.departmentForm.value;

    const operation = this.isEditMode && this.editingDepartmentId
      ? this.adminService.updateDepartment(this.editingDepartmentId, departmentData)
      : this.adminService.createDepartment(departmentData);

    operation.subscribe({
      next: (savedDepartment: Department) => {
        this.isSubmittingForm = false;
        this.successMessage = `Department ${this.isEditMode ? 'updated' : 'created'} successfully!`;
        this.closeDepartmentFormModal();
        this.loadDepartments(); // Refresh the list
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err: Error) => {
        this.errorMessage = err.message || `Failed to ${this.isEditMode ? 'update' : 'create'} department.`;
        this.isSubmittingForm = false;
      }
    });
  }

  confirmDeleteDepartment(departmentId: string, departmentName: string): void {
    if (confirm(`Are you sure you want to delete the department "${departmentName}"? This action cannot be undone.`)) {
      this.deleteDepartment(departmentId);
    }
  }

  deleteDepartment(departmentId: string): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.adminService.deleteDepartment(departmentId).subscribe({
      next: () => {
        this.successMessage = 'Department deleted successfully.';
        this.loadDepartments(); // Refresh list
        // If on a page that no longer exists after deletion, navigate to first page
        if (this.departments.length === 0 && this.currentPage > 1) {
            this.currentPage = this.totalPages > 0 ? this.totalPages : 1; // Go to last page or 1
            this.loadDepartments();
        }
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Failed to delete department.';
      }
    });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDepartments();
    }
  }
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDepartments();
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDepartments();
    }
  }
}